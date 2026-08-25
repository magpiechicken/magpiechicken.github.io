"use strict";

const SUPABASE_URL =
    "https://kxrjevmxayolcqcgmixz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_KrmPM2G4nuS1JXOAvnp-cA_Ik1nuYqS";

const NEWS_IMAGE_BUCKET =
    "news-images";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

let currentUser = null;
let currentProfile = null;
let isAdmin = false;
let currentNewsId = null;
let selectedImageFiles = [];

const introScreen =
    document.getElementById("screen-news-intro");

const listScreen =
    document.getElementById("screen-news-list");

const detailScreen =
    document.getElementById("screen-news-detail");

const writeScreen =
    document.getElementById("screen-write");

const authScreen =
    document.getElementById("screen-auth");

const donationScreen =
    document.getElementById("screen-donation");

const advancedNewsScreen =
    document.getElementById("screen-advanced-news");

const videoPreviewScreen =
    document.getElementById("screen-video-preview");

const newsMenu =
    document.getElementById("menu-news");

const donationMenu =
    document.getElementById("menu-donation");

const advancedNewsMenu =
    document.getElementById("menu-advanced-news");

const videoPreviewMenu =
    document.getElementById("menu-video-preview");

const accountButton =
    document.getElementById("accountButton");

const loginInfoButton =
    document.getElementById("loginInfoButton");

const loginInfoModal =
    document.getElementById("loginInfoModal");

const closeLoginInfo =
    document.getElementById("closeLoginInfo");

const loginInfoContent =
    document.getElementById("loginInfoContent");

const showWriteButton =
    document.getElementById("show-write");

const deleteNewsButton =
    document.getElementById("delete-news");

const loginTab =
    document.getElementById("login-tab");

const signupTab =
    document.getElementById("signup-tab");

const loginPanel =
    document.getElementById("auth-login-panel");

const signupPanel =
    document.getElementById("auth-signup-panel");

const authMessage =
    document.getElementById("auth-message");

const imageInput =
    document.getElementById("input-images");

const imagePreview =
    document.getElementById("image-preview");

const imageHelp =
    document.getElementById("image-help");

const detailImages =
    document.getElementById("news-detail-images");

const newsInteractions =
    document.getElementById("news-interactions");

const likeButton =
    document.getElementById("like-button");

const commentCount =
    document.getElementById("comment-count");

const commentsContainer =
    document.getElementById("comments-container");

const commentLoginNotice =
    document.getElementById("comment-login-notice");

const commentForm =
    document.getElementById("comment-form");

const commentInput =
    document.getElementById("comment-input");

const commentLength =
    document.getElementById("comment-length");

const commentSubmit =
    document.getElementById("comment-submit");


function hideAllScreens() {

    introScreen.classList.remove("visible");
    listScreen.classList.remove("visible");
    detailScreen.classList.remove("visible");
    writeScreen.classList.remove("visible");
    authScreen.classList.remove("visible");
    donationScreen.classList.remove("visible");
    advancedNewsScreen.classList.remove("visible");
    videoPreviewScreen.classList.remove("visible");
}


function clearMenuActive() {

    [
        newsMenu,
        donationMenu,
        advancedNewsMenu,
        videoPreviewMenu
    ].forEach(
        function(menu) {

            if (menu) {
                menu.classList.remove("active");
            }

        }
    );
}


function activateNewsMenu() {

    clearMenuActive();

    newsMenu.classList.add("active");
}


function activateDonationMenu() {

    clearMenuActive();

    donationMenu.classList.add("active");
}


function activateAdvancedNewsMenu() {

    clearMenuActive();

    advancedNewsMenu.classList.add("active");
}


function activateVideoPreviewMenu() {

    clearMenuActive();

    videoPreviewMenu.classList.add("active");
}


/* =========================
   관리자 전용 메뉴 관리
========================= */

function updateAdminOnlyMenus() {

    const adminMenus = [
        {
            element: advancedNewsMenu,
            title: "고급소식"
        },
        {
            element: videoPreviewMenu,
            title: "영상미리보기"
        }
    ];

    adminMenus.forEach(
        function(item) {

            if (!item.element) {
                return;
            }

            if (isAdmin) {

                item.element.disabled = false;

                item.element.classList.remove(
                    "locked"
                );

                item.element.textContent =
                    item.title;

            } else {

                item.element.disabled = true;

                item.element.classList.add(
                    "locked"
                );

                item.element.textContent =
                    `${item.title} 🔒`;
            }
        }
    );
}


function scrollTop() {

    const main =
        document.querySelector(".main-content");

    if (main) {
        main.scrollTop = 0;
    }
}


function updateAuthUI() {

    updateAdminOnlyMenus();

    if (!currentUser) {

        accountButton.textContent =
            "로그인";

        accountButton.classList.remove(
            "logged-in"
        );

        showWriteButton.classList.add(
            "hidden"
        );

        deleteNewsButton.classList.add(
            "hidden"
        );

        return;
    }

    const username =
        currentProfile?.username ||
        currentUser.email ||
        "회원";

    if (isAdmin) {

        accountButton.textContent =
            `${username} · 관리자`;

        accountButton.classList.add(
            "logged-in"
        );

        showWriteButton.classList.remove(
            "hidden"
        );

        if (currentNewsId !== null) {

            deleteNewsButton.classList.remove(
                "hidden"
            );

        } else {

            deleteNewsButton.classList.add(
                "hidden"
            );
        }

        return;
    }

    accountButton.textContent =
        `${username} · 로그아웃`;

    accountButton.classList.remove(
        "logged-in"
    );

    showWriteButton.classList.add(
        "hidden"
    );

    deleteNewsButton.classList.add(
        "hidden"
    );
}


async function loadCurrentProfile() {

    if (!currentUser) {

        currentProfile = null;
        isAdmin = false;

        updateAuthUI();

        return;
    }

    const {
        data: profile,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, username, can_manage_news"
            )
            .eq(
                "id",
                currentUser.id
            )
            .maybeSingle();

    if (error) {

        console.error(
            "Profile 조회 오류:",
            error
        );

        currentProfile = null;
        isAdmin = false;

        updateAuthUI();

        return;
    }

    currentProfile =
        profile || null;

    isAdmin =
        profile?.can_manage_news === true;

    updateAuthUI();
}


async function refreshAuthState() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();

    if (
        error ||
        !data ||
        !data.user
    ) {

        currentUser = null;
        currentProfile = null;
        isAdmin = false;

        updateAuthUI();

        return;
    }

    currentUser =
        data.user;

    await loadCurrentProfile();
}


function openNewsIntro() {

    hideAllScreens();

    introScreen.classList.add(
        "visible"
    );

    activateNewsMenu();

    currentNewsId = null;

    detailImages.classList.add(
        "hidden"
    );

    detailImages.innerHTML = "";

    if (newsInteractions) {

        newsInteractions.classList.add(
            "hidden"
        );
    }

    if (commentsContainer) {
        commentsContainer.innerHTML = "";
    }

    if (commentInput) {
        commentInput.value = "";
    }

    updateCommentLength();

    updateAuthUI();

    scrollTop();
}


async function openNewsList() {

    hideAllScreens();

    listScreen.classList.add(
        "visible"
    );

    activateNewsMenu();

    currentNewsId = null;

    updateAuthUI();

    scrollTop();

    await renderNews();
}


function openWriteScreen() {

    if (!currentUser) {

        openAuthScreen("login");

        return;
    }

    if (!isAdmin) {

        alert(
            "관리자만 소식을 작성할 수 있습니다."
        );

        return;
    }

    resetWriteForm();

    hideAllScreens();

    writeScreen.classList.add(
        "visible"
    );

    activateNewsMenu();

    scrollTop();
}


function openDonation() {

    hideAllScreens();

    donationScreen.classList.add(
        "visible"
    );

    activateDonationMenu();

    scrollTop();
}


/* =========================
   관리자 전용 화면
========================= */

function openAdvancedNews() {

    if (!currentUser) {

        alert(
            "고급소식은 관리자만 이용할 수 있습니다."
        );

        openAuthScreen("login");

        return;
    }

    if (!isAdmin) {

        alert(
            "고급소식은 관리자만 이용할 수 있습니다."
        );

        return;
    }

    hideAllScreens();

    advancedNewsScreen.classList.add(
        "visible"
    );

    activateAdvancedNewsMenu();

    scrollTop();
}


function openVideoPreview() {

    if (!currentUser) {

        alert(
            "영상미리보기는 관리자만 이용할 수 있습니다."
        );

        openAuthScreen("login");

        return;
    }

    if (!isAdmin) {

        alert(
            "영상미리보기는 관리자만 이용할 수 있습니다."
        );

        return;
    }

    hideAllScreens();

    videoPreviewScreen.classList.add(
        "visible"
    );

    activateVideoPreviewMenu();

    scrollTop();
}


function openAuthScreen(
    mode = "login"
) {

    hideAllScreens();

    authScreen.classList.add(
        "visible"
    );

    activateNewsMenu();

    showAuthMode(mode);

    authMessage.textContent = "";

    scrollTop();
}


function showAuthMode(
    mode
) {

    const isLogin =
        mode === "login";

    loginTab.classList.toggle(
        "active",
        isLogin
    );

    signupTab.classList.toggle(
        "active",
        !isLogin
    );

    loginPanel.classList.toggle(
        "hidden",
        !isLogin
    );

    signupPanel.classList.toggle(
        "hidden",
        isLogin
    );

    authMessage.textContent = "";
}


/* =========================
   이하 기존 로그인 / 회원가입 /
   소식 / 사진 / 좋아요 / 댓글 코드
   그대로 유지
========================= */
