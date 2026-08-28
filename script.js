"use strict";

const SUPABASE_URL = "https://kxrjevmxayolcqcgmixz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_KrmPM2G4nuS1JXOAvnp-cA_Ik1nuYqS";
const NEWS_IMAGE_BUCKET = "news-images";
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

let currentUser = null;
let currentProfile = null;
let isAdmin = false;
let currentNewsId = null;
let selectedImageFiles = [];
let editingNewsId = null;

const $ = id => document.getElementById(id);

const introScreen = $("screen-news-intro");
const listScreen = $("screen-news-list");
const detailScreen = $("screen-news-detail");
const writeScreen = $("screen-write");
const authScreen = $("screen-auth");
const donationScreen = $("screen-donation");
const advancedNewsScreen = $("screen-advanced-news");
const videoPreviewScreen = $("screen-video-preview");

const newsMenu = $("menu-news");
const donationMenu = $("menu-donation");
const advancedNewsMenu = $("menu-advanced-news");
const videoPreviewMenu = $("menu-video-preview");

const accountButton = $("accountButton");
const loginInfoButton = $("loginInfoButton");
const loginInfoModal = $("loginInfoModal");
const closeLoginInfo = $("closeLoginInfo");
const loginInfoContent = $("loginInfoContent");

const showWriteButton = $("show-write");
const deleteNewsButton = $("delete-news");

const loginTab = $("login-tab");
const signupTab = $("signup-tab");
const loginPanel = $("auth-login-panel");
const signupPanel = $("auth-signup-panel");
const authMessage = $("auth-message");

const imageInput = $("input-images");
const imagePreview = $("image-preview");
const imageHelp = $("image-help");

const detailImages = $("news-detail-images");
const newsInteractions = $("news-interactions");
const likeButton = $("like-button");
const commentCount = $("comment-count");
const commentsContainer = $("comments-container");
const commentLoginNotice = $("comment-login-notice");
const commentForm = $("comment-form");
const commentInput = $("comment-input");
const commentLength = $("comment-length");
const commentSubmit = $("comment-submit");


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatDate(value) {
    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return "";
    }

    return (
        `${d.getFullYear()}.` +
        `${String(d.getMonth() + 1).padStart(2, "0")}.` +
        `${String(d.getDate()).padStart(2, "0")}`
    );
}


function formatDateTime(value) {
    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return "";
    }

    return (
        `${formatDate(value)} ` +
        `${String(d.getHours()).padStart(2, "0")}:` +
        `${String(d.getMinutes()).padStart(2, "0")}`
    );
}


function scrollTop() {
    const main = document.querySelector(".main-content");

    if (main) {
        main.scrollTop = 0;
    }
}


function hideAllScreens() {
    [
        introScreen,
        listScreen,
        detailScreen,
        writeScreen,
        authScreen,
        donationScreen,
        advancedNewsScreen,
        videoPreviewScreen
    ].forEach(screen => {
        screen?.classList.remove("visible");
    });
}


function clearMenuActive() {
    [
        newsMenu,
        donationMenu,
        advancedNewsMenu,
        videoPreviewMenu
    ].forEach(menu => {
        menu?.classList.remove("active");
    });
}


function activateMenu(menu) {
    clearMenuActive();
    menu?.classList.add("active");
}


/* =========================
   관리자 전용 메뉴
========================= */

function updateAdminOnlyMenus() {
    [
        [advancedNewsMenu, "고급소식"],
        [videoPreviewMenu, "영상미리보기"]
    ].forEach(([element, title]) => {

        if (!element) {
            return;
        }

        element.disabled = !isAdmin;
        element.classList.toggle("locked", !isAdmin);
        element.textContent =
            isAdmin
                ? title
                : `${title} 🔒`;
    });
}


/* =========================
   로그인 UI
========================= */

function updateAuthUI() {
    updateAdminOnlyMenus();

    if (!currentUser) {
        accountButton.textContent = "로그인";

        accountButton.classList.remove(
            "logged-in"
        );

        showWriteButton?.classList.add(
            "hidden"
        );

        deleteNewsButton?.classList.add(
            "hidden"
        );

        return;
    }

    const id =
        currentProfile?.username ||
        currentUser.email ||
        "회원";

    accountButton.textContent =
        isAdmin
            ? `${id} · 관리자`
            : `${id} · 로그아웃`;

    accountButton.classList.toggle(
        "logged-in",
        isAdmin
    );

    showWriteButton?.classList.toggle(
        "hidden",
        !isAdmin
    );

    deleteNewsButton?.classList.toggle(
        "hidden",
        !isAdmin ||
        currentNewsId === null
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
        !data?.user
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


/* =========================
   화면 이동
========================= */

function openNewsIntro() {
    hideAllScreens();

    introScreen?.classList.add(
        "visible"
    );

    activateMenu(
        newsMenu
    );

    currentNewsId = null;
    editingNewsId = null;

    document
        .getElementById(
            "edit-news-button"
        )
        ?.remove();

    detailImages?.classList.add(
        "hidden"
    );

    if (detailImages) {
        detailImages.innerHTML = "";
    }

    newsInteractions?.classList.add(
        "hidden"
    );

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

    listScreen?.classList.add(
        "visible"
    );

    activateMenu(
        newsMenu
    );

    currentNewsId = null;
    editingNewsId = null;

    updateAuthUI();
    scrollTop();

    await renderNews();
}


function openDonation() {
    hideAllScreens();

    donationScreen?.classList.add(
        "visible"
    );

    activateMenu(
        donationMenu
    );

    scrollTop();
}


function openAdvancedNews() {
    if (!isAdmin) {

        if (!currentUser) {
            openAuthScreen(
                "login"
            );

            return;
        }

        alert(
            "고급소식은 관리자만 이용할 수 있습니다."
        );

        return;
    }

    hideAllScreens();

    advancedNewsScreen?.classList.add(
        "visible"
    );

    activateMenu(
        advancedNewsMenu
    );

    scrollTop();
}


function openVideoPreview() {
    if (!isAdmin) {

        if (!currentUser) {
            openAuthScreen(
                "login"
            );

            return;
        }

        alert(
            "영상미리보기는 관리자만 이용할 수 있습니다."
        );

        return;
    }

    hideAllScreens();

    videoPreviewScreen?.classList.add(
        "visible"
    );

    activateMenu(
        videoPreviewMenu
    );

    scrollTop();
}


function openAuthScreen(
    mode = "login"
) {
    hideAllScreens();

    authScreen?.classList.add(
        "visible"
    );

    activateMenu(
        newsMenu
    );

    showAuthMode(
        mode
    );

    if (authMessage) {
        authMessage.textContent = "";
    }

    scrollTop();
}


function showAuthMode(
    mode
) {
    const isLogin =
        mode === "login";

    loginTab?.classList.toggle(
        "active",
        isLogin
    );

    signupTab?.classList.toggle(
        "active",
        !isLogin
    );

    loginPanel?.classList.toggle(
        "hidden",
        !isLogin
    );

    signupPanel?.classList.toggle(
        "hidden",
        isLogin
    );

    if (authMessage) {
        authMessage.textContent = "";
    }
}


/* =========================
   로그인 정보
========================= */

async function handleAccountButton() {
    if (!currentUser) {
        openAuthScreen(
            "login"
        );

        return;
    }

    await logout();
}


function openLoginInfo() {
    const status =
        currentUser
            ? `
                <div class="login-info-status">
                    현재 상태: 로그인 상태
                    <br>
                    사용자:
                    ${escapeHTML(
                        currentProfile?.username ||
                        currentUser.email ||
                        "회원"
                    )}
                    <br>
                    권한:
                    ${
                        isAdmin
                            ? "관리자"
                            : "일반 회원"
                    }
                </div>
              `
            : `
                <div class="login-info-status">
                    현재 상태: 로그아웃 상태
                </div>
              `;

    loginInfoContent.innerHTML = `
        ${status}

        <div class="login-info-section">
            <h3>
                로그아웃 상태 · 장점
            </h3>

            <ul>
                <li>
                    로그인하지 않아도 사이트를 볼 수 있습니다.
                </li>

                <li>
                    빠르게 소식을 확인할 수 있습니다.
                </li>
            </ul>
        </div>

        <div class="login-info-section">
            <h3>
                로그인 상태 · 장점
            </h3>

            <ul>
                <li>
                    개인별 안읽은 소식을 사용할 수 있습니다.
                </li>

                <li>
                    좋아요와 댓글을 사용할 수 있습니다.
                </li>

                <li>
                    관리자는 소식을 작성·수정·삭제할 수 있습니다.
                </li>
            </ul>
        </div>
    `;

    loginInfoModal?.classList.remove(
        "hidden"
    );
}


function closeLoginInfoModal() {
    loginInfoModal?.classList.add(
        "hidden"
    );
}


/* =========================
   인증
========================= */

async function login() {
    const email =
        $("login-email")
            ?.value
            .trim() || "";

    const password =
        $("login-password")
            ?.value || "";

    authMessage.textContent =
        "";

    if (!email) {
        authMessage.textContent =
            "이메일을 입력해주세요.";

        return;
    }

    if (!password) {
        authMessage.textContent =
            "비밀번호를 입력해주세요.";

        return;
    }

    const button =
        $("login-submit");

    button.disabled =
        true;

    button.textContent =
        "로그인 중...";

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });

        if (error) {
            throw error;
        }

        currentUser =
            data.user;

        await loadCurrentProfile();

        if (!currentProfile) {

            await supabaseClient
                .auth
                .signOut();

            currentUser = null;
            currentProfile = null;
            isAdmin = false;

            updateAuthUI();

            throw new Error(
                "로그인은 성공했지만 회원 정보를 찾지 못했습니다."
            );
        }

        await openNewsList();

    } catch (error) {

        console.error(
            "로그인 오류:",
            error
        );

        authMessage.textContent =
            error.message ||
            "로그인 중 오류가 발생했습니다.";

    } finally {

        button.disabled =
            false;

        button.textContent =
            "로그인";
    }
}


async function signup() {
    const username =
        $("signup-username")
            ?.value
            .trim() || "";

    const email =
        $("signup-email")
            ?.value
            .trim() || "";

    const password =
        $("signup-password")
            ?.value || "";

    const confirm =
        $("signup-password-confirm")
            ?.value || "";

    authMessage.textContent =
        "";

    if (!username) {
        authMessage.textContent =
            "아이디를 입력해주세요.";

        return;
    }

    if (username.length < 2) {
        authMessage.textContent =
            "아이디는 2자 이상 입력해주세요.";

        return;
    }

    if (!email) {
        authMessage.textContent =
            "이메일을 입력해주세요.";

        return;
    }

    if (!password) {
        authMessage.textContent =
            "비밀번호를 입력해주세요.";

        return;
    }

    if (password.length < 6) {
        authMessage.textContent =
            "비밀번호는 6자 이상 입력해주세요.";

        return;
    }

    if (password !== confirm) {
        authMessage.textContent =
            "비밀번호가 일치하지 않습니다.";

        return;
    }

    const button =
        $("signup-submit");

    button.disabled =
        true;

    button.textContent =
        "가입 중...";

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username
                        }
                    }
                });

        if (error) {
            throw error;
        }

        if (
            data.user &&
            data.session
        ) {

            currentUser =
                data.user;

            await loadCurrentProfile();

            if (!currentProfile) {
                throw new Error(
                    "회원 정보를 만들지 못했습니다."
                );
            }

            await openNewsList();

            return;
        }

        authMessage.textContent =
            "회원가입이 완료되었습니다. 이메일 인증이 필요한 경우 이메일을 확인해주세요.";

        $("login-email").value =
            email;

        showAuthMode(
            "login"
        );

    } catch (error) {

        console.error(
            "회원가입 오류:",
            error
        );

        authMessage.textContent =
            error.message ||
            "회원가입 중 오류가 발생했습니다.";

    } finally {

        button.disabled =
            false;

        button.textContent =
            "회원가입";
    }
}


async function logout() {
    const {
        error
    } =
        await supabaseClient
            .auth
            .signOut();

    if (error) {
        alert(
            "로그아웃 오류:\n" +
            error.message
        );

        return;
    }

    currentUser = null;
    currentProfile = null;
    isAdmin = false;
    currentNewsId = null;
    editingNewsId = null;

    updateAuthUI();
    openNewsIntro();
}


/* =========================
   소식 데이터
========================= */

async function getNews() {
    const {
        data,
        error
    } =
        await supabaseClient
            .from("news")
            .select(
                "id, author, title, content, created_at, image_urls, view_count"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(
            "소식 불러오기 오류:",
            error
        );

        alert(
            "소식 불러오기 오류:\n" +
            error.message
        );

        return [];
    }

    return data || [];
}


async function getNewsInteractionCounts(
    newsList
) {
    const map =
        new Map();

    (newsList || [])
        .forEach(
            news => {
                map.set(
                    String(news.id),
                    {
                        likes: 0,
                        comments: 0
                    }
                );
            }
        );

    const ids =
        (newsList || [])
            .map(
                news => news.id
            );

    if (!ids.length) {
        return map;
    }

    const [
        likesResult,
        commentsResult
    ] =
        await Promise.all([

            supabaseClient
                .from("news_likes")
                .select("news_id")
                .in(
                    "news_id",
                    ids
                ),

            supabaseClient
                .from("news_comments")
                .select("news_id")
                .in(
                    "news_id",
                    ids
                )
        ]);

    if (
        !likesResult.error
    ) {

        (likesResult.data || [])
            .forEach(
                row => {

                    const state =
                        map.get(
                            String(
                                row.news_id
                            )
                        );

                    if (state) {
                        state.likes++;
                    }
                }
            );

    } else {

        console.error(
            "좋아요 개수 조회 오류:",
            likesResult.error
        );
    }

    if (
        !commentsResult.error
    ) {

        (commentsResult.data || [])
            .forEach(
                row => {

                    const state =
                        map.get(
                            String(
                                row.news_id
                            )
                        );

                    if (state) {
                        state.comments++;
                    }
                }
            );

    } else {

        console.error(
            "댓글 개수 조회 오류:",
            commentsResult.error
        );
    }

    return map;
}


async function incrementNewsView(
    newsId
) {
    const {
        error
    } =
        await supabaseClient
            .rpc(
                "increment_news_view",
                {
                    p_news_id:
                        newsId
                }
            );

    if (error) {
        console.error(
            "조회수 증가 오류:",
            error
        );
    }
}


async function getReadNewsIds(
    newsList
) {
    if (
        !currentUser ||
        !newsList?.length
    ) {
        return new Set();
    }

    const ids =
        newsList.map(
            news => String(
                news.id
            )
        );

    const {
        data,
        error
    } =
        await supabaseClient
            .from("news_reads")
            .select(
                "news_id"
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .in(
                "news_id",
                ids
            );

    if (error) {

        console.error(
            "읽음 상태 조회 오류:",
            error
        );

        return new Set();
    }

    return new Set(
        (data || [])
            .map(
                row =>
                    String(
                        row.news_id
                    )
            )
    );
}


async function markNewsAsRead(
    newsId
) {
    if (!currentUser) {
        return;
    }

    const {
        error
    } =
        await supabaseClient
            .from("news_reads")
            .upsert(
                {
                    user_id:
                        currentUser.id,

                    news_id:
                        String(
                            newsId
                        ),

                    read_at:
                        new Date()
                            .toISOString()
                },
                {
                    onConflict:
                        "user_id,news_id"
                }
            );

    if (error) {
        console.error(
            "읽음 처리 오류:",
            error
        );
    }
}


/* =========================
   소식 목록
========================= */

async function renderNews() {
    const container =
        $("news-list-container");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-box">
            <div class="empty-title">
                불러오는 중...
            </div>
        </div>
    `;

    const news =
        await getNews();

    if (!news.length) {

        container.innerHTML = `
            <div class="empty-box">
                <div class="empty-title">
                    소식 없음
                </div>

                <div class="empty-description">
                    현재 등록된 소식이 없습니다.
                </div>
            </div>
        `;

        return;
    }

    const reads =
        await getReadNewsIds(
            news
        );

    const counts =
        await getNewsInteractionCounts(
            news
        );

    container.innerHTML =
        "";

    const list =
        document.createElement(
            "div"
        );

    list.className =
        "news-list";

    news.forEach(
        newsItem => {

            const key =
                String(
                    newsItem.id
                );

            const unread =
                !!currentUser &&
                !reads.has(key);

            const count =
                counts.get(key) || {
                    likes: 0,
                    comments: 0
                };

            const row =
                document.createElement(
                    "button"
                );

            row.type =
                "button";

            row.className =
                unread
                    ? "news-row unread"
                    : "news-row";

            row.innerHTML = `
                <span class="news-author">
                    (${escapeHTML(
                        newsItem.author
                    )})
                </span>

                <span class="news-title">
                    ${escapeHTML(
                        newsItem.title
                    )}

                    ${
                        unread
                            ? `
                                <span class="news-unread">
                                    (안읽은 소식)
                                </span>
                              `
                            : ""
                    }
                </span>

                <span class="news-date">
                    ${formatDate(
                        newsItem.created_at
                    )}
                    <br>

                    <span class="news-meta">
                        조회 ${Number(
                            newsItem.view_count || 0
                        )}
                        · ♥ ${count.likes}
                        · 💬 ${count.comments}
                    </span>
                </span>
            `;

            row.addEventListener(
                "click",
                () => {
                    openNewsDetail(
                        newsItem.id
                    );
                }
            );

            list.appendChild(
                row
            );
        }
    );

    container.appendChild(
        list
    );
}


/* =========================
   소식 상세
========================= */

async function openNewsDetail(
    newsId,
    countView = true
) {
    const {
        data: news,
        error
    } =
        await supabaseClient
            .from("news")
            .select(
                "id, author, title, content, created_at, image_urls, view_count"
            )
            .eq(
                "id",
                newsId
            )
            .single();

    if (error) {

        console.error(
            "상세 소식 조회 오류:",
            error
        );

        alert(
            "소식을 불러오지 못했습니다.\n" +
            error.message
        );

        return;
    }

    if (currentUser) {
        await markNewsAsRead(
            news.id
        );
    }

    if (countView) {
        await incrementNewsView(
            news.id
        );

        news.view_count =
            Number(
                news.view_count || 0
            ) + 1;
    }

    currentNewsId =
        news.id;

    editingNewsId =
        null;

    hideAllScreens();

    detailScreen?.classList.add(
        "visible"
    );

    activateMenu(
        newsMenu
    );

    document
        .getElementById(
            "edit-news-button"
        )
        ?.remove();

    detailImages.innerHTML =
        "";

    const imageUrls =
        Array.isArray(
            news.image_urls
        )
            ? news.image_urls
            : [];

    imageUrls.forEach(
        path => {

            const url =
                getPublicImageUrl(
                    path
                );

            if (!url) {
                return;
            }

            const img =
                document.createElement(
                    "img"
                );

            img.className =
                "news-image";

            img.src =
                url;

            img.alt =
                "소식 첨부 사진";

            img.loading =
                "lazy";

            detailImages.appendChild(
                img
            );
        }
    );

    detailImages.classList.toggle(
        "hidden",
        detailImages.children.length === 0
    );

    $("news-detail-container").innerHTML = `
        <div class="detail-author">
            (${escapeHTML(
                news.author
            )})
        </div>

        <div class="detail-title-line">

            <h1 class="detail-title">
                ${escapeHTML(
                    news.title
                )}
            </h1>

            <span class="detail-date">
                ${formatDate(
                    news.created_at
                )}
            </span>

        </div>

        <div class="detail-content">
            ${escapeHTML(
                news.content
            ).replace(
                /\n/g,
                "<br>"
            )}
        </div>

        <div class="news-detail-viewcount">
            조회수 ${Number(
                news.view_count || 0
            )}
        </div>
    `;

    if (isAdmin) {

        const editButton =
            document.createElement(
                "button"
            );

        editButton.id =
            "edit-news-button";

        editButton.className =
            "orange-small-button";

        editButton.type =
            "button";

        editButton.textContent =
            "소식 수정";

        editButton.style.marginTop =
            "12px";

        editButton.addEventListener(
            "click",
            () => {
                openEditScreen(
                    news
                );
            }
        );

        $("news-detail-container")
            .appendChild(
                editButton
            );
    }

    updateAuthUI();

    if (commentInput) {
        commentInput.value =
            "";
    }

    updateCommentLength();

    await renderNewsInteractions(
        news.id
    );

    scrollTop();
}


function getPublicImageUrl(
    path
) {
    if (!path) {
        return null;
    }

    if (
        path.startsWith(
            "http://"
        ) ||
        path.startsWith(
            "https://"
        )
    ) {
        return path;
    }

    return supabaseClient
        .storage
        .from(
            NEWS_IMAGE_BUCKET
        )
        .getPublicUrl(
            path
        )
        .data?.publicUrl || null;
}


/* =========================
   좋아요
========================= */

async function loadLikeState(
    newsId
) {
    const result = {
        count: 0,
        liked: false
    };

    if (!currentUser) {
        return result;
    }

    const {
        count,
        error: countError
    } =
        await supabaseClient
            .from("news_likes")
            .select(
                "id",
                {
                    count:
                        "exact",
                    head:
                        true
                }
            )
            .eq(
                "news_id",
                newsId
            );

    if (!countError) {
        result.count =
            count || 0;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("news_likes")
            .select(
                "id"
            )
            .eq(
                "news_id",
                newsId
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .maybeSingle();

    if (!error) {
        result.liked =
            !!data;
    }

    return result;
}


function updateLikeButton(
    state
) {
    if (!likeButton) {
        return;
    }

    likeButton.classList.toggle(
        "liked",
        !!state.liked
    );

    likeButton.innerHTML = `
        ${state.liked ? "♥" : "♡"}
        좋아요
        <span class="like-count-number">
            ${state.count || 0}
        </span>
    `;
}


async function toggleLike() {
    if (!currentUser) {
        alert(
            "좋아요를 누르려면 로그인해주세요."
        );

        openAuthScreen(
            "login"
        );

        return;
    }

    if (!currentNewsId) {
        return;
    }

    likeButton.disabled =
        true;

    try {

        const state =
            await loadLikeState(
                currentNewsId
            );

        if (state.liked) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "news_likes"
                    )
                    .delete()
                    .eq(
                        "news_id",
                        currentNewsId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    );

            if (error) {
                throw error;
            }

        } else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "news_likes"
                    )
                    .insert({
                        news_id:
                            currentNewsId,

                        user_id:
                            currentUser.id
                    });

            if (
                error &&
                error.code !==
                    "23505"
            ) {
                throw error;
            }
        }

        updateLikeButton(
            await loadLikeState(
                currentNewsId
            )
        );

    } catch (error) {

        console.error(
            "좋아요 처리 오류:",
            error
        );

        alert(
            "좋아요 처리 중 오류가 발생했습니다.\n" +
            error.message
        );

    } finally {

        likeButton.disabled =
            false;
    }
}


/* =========================
   댓글
========================= */

function updateCommentLength() {
    if (
        !commentInput ||
        !commentLength
    ) {
        return;
    }

    commentLength.textContent =
        `${commentInput.value.length} / 500`;
}


async function loadComments(
    newsId
) {
    if (
        !commentsContainer ||
        !commentCount
    ) {
        return;
    }

    commentsContainer.innerHTML = `
        <div class="comments-loading">
            댓글을 불러오는 중...
        </div>
    `;

    if (!currentUser) {

        commentsContainer.innerHTML = `
            <div class="comments-login-box">
                댓글은 로그인한 회원에게만 표시됩니다.
            </div>
        `;

        commentCount.textContent =
            "댓글";

        return;
    }

    const {
        data: comments,
        error
    } =
        await supabaseClient
            .from(
                "news_comments"
            )
            .select(
                "id, news_id, user_id, content, created_at"
            )
            .eq(
                "news_id",
                newsId
            )
            .order(
                "created_at",
                {
                    ascending:
                        true
                }
            );

    if (error) {

        console.error(
            "댓글 조회 오류:",
            error
        );

        commentsContainer.innerHTML = `
            <div class="comments-error">
                댓글을 불러오지 못했습니다.
            </div>
        `;

        commentCount.textContent =
            "댓글";

        return;
    }

    const list =
        comments || [];

    commentCount.textContent =
        `댓글 ${list.length}개`;

    commentsContainer.innerHTML =
        "";

    if (!list.length) {

        commentsContainer.innerHTML = `
            <div class="comments-empty">
                아직 댓글이 없습니다.
            </div>
        `;

        return;
    }

    const userIds =
        [
            ...new Set(
                list.map(
                    comment =>
                        comment.user_id
                )
            )
        ];

    let profileMap =
        new Map();

    if (userIds.length) {

        const {
            data: profiles,
            error: profileError
        } =
            await supabaseClient
                .from(
                    "profiles"
                )
                .select(
                    "id, username"
                )
                .in(
                    "id",
                    userIds
                );

        if (!profileError) {

            profileMap =
                new Map(
                    (profiles || [])
                        .map(
                            profile => [
                                String(
                                    profile.id
                                ),
                                profile.username
                            ]
                        )
                );
        }
    }

    list.forEach(
        comment => {

            const item =
                document.createElement(
                    "article"
                );

            item.className =
                "comment-item";

            /*
                username을 댓글 닉네임처럼 사용하지 않고
                실제 가입 ID를 표시.
                현재 profiles.username에 가입 ID가 저장되어 있다는
                기존 구조 기준.
            */

            const userId =
                profileMap.get(
                    String(
                        comment.user_id
                    )
                ) ||
                "회원";

            const own =
                currentUser &&
                String(
                    currentUser.id
                ) ===
                    String(
                        comment.user_id
                    );

            item.innerHTML = `
                <div class="comment-top">

                    <strong class="comment-author">
                        ${escapeHTML(
                            userId
                        )}
                    </strong>

                    <span class="comment-date">
                        ${formatDateTime(
                            comment.created_at
                        )}
                    </span>

                </div>

                <div class="comment-content">
                    ${escapeHTML(
                        comment.content
                    ).replace(
                        /\n/g,
                        "<br>"
                    )}
                </div>

                ${
                    own
                        ? `
                            <button
                                class="comment-delete-button"
                                type="button"
                                data-comment-id="${comment.id}"
                            >
                                삭제
                            </button>
                          `
                        : ""
                }
            `;

            commentsContainer.appendChild(
                item
            );
        }
    );

    commentsContainer
        .querySelectorAll(
            ".comment-delete-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteComment(
                            button.dataset.commentId
                        );
                    }
                );
            }
        );
}


async function submitComment() {
    if (!currentUser) {

        alert(
            "댓글을 작성하려면 로그인해주세요."
        );

        openAuthScreen(
            "login"
        );

        return;
    }

    if (!currentNewsId) {
        return;
    }

    const content =
        commentInput.value.trim();

    if (!content) {

        alert(
            "댓글 내용을 입력해주세요."
        );

        return;
    }

    if (content.length > 500) {

        alert(
            "댓글은 500자까지 입력할 수 있습니다."
        );

        return;
    }

    commentSubmit.disabled =
        true;

    commentSubmit.textContent =
        "등록 중...";

    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "news_comments"
                )
                .insert({
                    news_id:
                        currentNewsId,

                    user_id:
                        currentUser.id,

                    content
                });

        if (error) {
            throw error;
        }

        commentInput.value =
            "";

        updateCommentLength();

        await loadComments(
            currentNewsId
        );

    } catch (error) {

        console.error(
            "댓글 등록 오류:",
            error
        );

        alert(
            "댓글 등록 중 오류가 발생했습니다.\n" +
            error.message
        );

    } finally {

        commentSubmit.disabled =
            false;

        commentSubmit.textContent =
            "댓글 등록";
    }
}


async function deleteComment(
    commentId
) {
    if (!currentUser) {
        return;
    }

    const confirmed =
        window.confirm(
            "이 댓글을 삭제하시겠습니까?"
        );

    if (!confirmed) {
        return;
    }

    const {
        error
    } =
        await supabaseClient
            .from(
                "news_comments"
            )
            .delete()
            .eq(
                "id",
                commentId
            )
            .eq(
                "user_id",
                currentUser.id
            );

    if (error) {

        console.error(
            "댓글 삭제 오류:",
            error
        );

        alert(
            "댓글 삭제 중 오류가 발생했습니다.\n" +
            error.message
        );

        return;
    }

    await loadComments(
        currentNewsId
    );
}


async function renderNewsInteractions(
    newsId
) {
    if (!newsInteractions) {
        return;
    }

    newsInteractions.classList.remove(
        "hidden"
    );

    if (!currentUser) {

        likeButton.disabled =
            false;

        likeButton.classList.remove(
            "liked"
        );

        likeButton.innerHTML = `
            ♡ 좋아요
            <span class="like-count-number">
                0
            </span>
        `;

        commentLoginNotice?.classList.remove(
            "hidden"
        );

        commentForm?.classList.add(
            "hidden"
        );

        await loadComments(
            newsId
        );

        return;
    }

    commentLoginNotice?.classList.add(
        "hidden"
    );

    commentForm?.classList.remove(
        "hidden"
    );

    updateLikeButton(
        await loadLikeState(
            newsId
        )
    );

    await loadComments(
        newsId
    );
}


/* =========================
   이미지
========================= */

function resetWriteForm() {
    [
        "input-title",
        "input-content"
    ].forEach(
        id => {

            if ($(id)) {
                $(id).value =
                    "";
            }
        }
    );

    if (imageInput) {
        imageInput.value =
            "";
    }

    selectedImageFiles =
        [];

    editingNewsId =
        null;

    renderImagePreview();

    const heading =
        writeScreen?.querySelector(
            ".write-box h1"
        );

    if (heading) {
        heading.textContent =
            "소식 작성";
    }

    const saveButton =
        $("save-write");

    if (saveButton) {
        saveButton.textContent =
            "소식 등록";
    }
}


function validateSelectedImages(
    files
) {
    if (
        files.length >
        MAX_IMAGES
    ) {
        return {
            valid:
                false,

            message:
                `사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`
        };
    }

    for (
        const file of files
    ) {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {
            return {
                valid:
                    false,

                message:
                    `"${file.name}"은(는) 이미지 파일이 아닙니다.`
            };
        }

        if (
            file.size >
            MAX_IMAGE_SIZE
        ) {
            return {
                valid:
                    false,

                message:
                    `"${file.name}"의 크기가 5MB를 초과합니다.`
            };
        }
    }

    return {
        valid:
            true,

        message:
            ""
    };
}


function handleImageSelection(
    event
) {
    const files =
        [
            ...(event.target.files || [])
        ];

    const validation =
        validateSelectedImages(
            files
        );

    if (!validation.valid) {

        alert(
            validation.message
        );

        event.target.value =
            "";

        selectedImageFiles =
            [];

        renderImagePreview();

        return;
    }

    selectedImageFiles =
        files;

    renderImagePreview();
}


function renderImagePreview() {
    if (!imagePreview) {
        return;
    }

    imagePreview.innerHTML =
        "";

    selectedImageFiles.forEach(
        file => {

            const item =
                document.createElement(
                    "div"
                );

            const img =
                document.createElement(
                    "img"
                );

            const name =
                document.createElement(
                    "div"
                );

            item.className =
                "preview-item";

            img.alt =
                "선택한 사진 미리보기";

            name.className =
                "preview-name";

            name.textContent =
                file.name;

            item.append(
                img,
                name
            );

            imagePreview.appendChild(
                item
            );

            const reader =
                new FileReader();

            reader.onload =
                event => {
                    img.src =
                        event.target.result;
                };

            reader.readAsDataURL(
                file
            );
        }
    );

    if (imageHelp) {

        imageHelp.textContent =
            selectedImageFiles.length
                ? `${selectedImageFiles.length}장 선택됨 · 최대 ${MAX_IMAGES}장`
                : `사진을 선택하면 아래에 미리보기가 표시됩니다. 최대 ${MAX_IMAGES}장 · 사진 1장당 최대 5MB`;
    }
}


function createSafeFileName(
    originalName
) {
    const extension =
        originalName.includes(
            "."
        )
            ? originalName
                .split(".")
                .pop()
                .toLowerCase()
            : "jpg";

    const random =
        typeof crypto !==
            "undefined" &&
        typeof crypto.randomUUID ===
            "function"
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random()
                  .toString(36)
                  .slice(2)}`;

    return `${random}.${extension}`;
}


async function deleteUploadedImages(
    paths
) {
    if (!paths?.length) {
        return;
    }

    const {
        error
    } =
        await supabaseClient
            .storage
            .from(
                NEWS_IMAGE_BUCKET
            )
            .remove(
                paths
            );

    if (error) {
        console.error(
            "이미지 정리 오류:",
            error
        );
    }
}


/* =========================
   소식 작성 / 수정
========================= */

function openEditScreen(
    news
) {
    if (!isAdmin) {
        return;
    }

    editingNewsId =
        news.id;

    $("input-title").value =
        news.title || "";

    $("input-content").value =
        news.content || "";

    selectedImageFiles =
        [];

    if (imageInput) {
        imageInput.value =
            "";
    }

    renderImagePreview();

    hideAllScreens();

    writeScreen?.classList.add(
        "visible"
    );

    activateMenu(
        newsMenu
    );

    const heading =
        writeScreen?.querySelector(
            ".write-box h1"
        );

    if (heading) {
        heading.textContent =
            "소식 수정";
    }

    const saveButton =
        $("save-write");

    if (saveButton) {
        saveButton.textContent =
            "수정 저장";
    }

    scrollTop();
}


function closeWriteMode() {
    editingNewsId =
        null;

    resetWriteForm();
}


async function saveNews() {
    if (!currentUser) {
        openAuthScreen(
            "login"
        );

        return;
    }

    if (!isAdmin) {

        alert(
            "관리자만 소식을 작성할 수 있습니다."
        );

        return;
    }

    const title =
        $("input-title")
            .value
            .trim();

    const content =
        $("input-content")
            .value
            .trim();

    if (!title) {

        alert(
            "제목을 입력해주세요."
        );

        return;
    }

    if (!content) {

        alert(
            "내용을 입력해주세요."
        );

        return;
    }

    const button =
        $("save-write");

    const files =
        imageInput
            ? [
                ...imageInput.files
            ]
            : [];

    const validation =
        validateSelectedImages(
            files
        );

    if (!validation.valid) {

        alert(
            validation.message
        );

        return;
    }

    const wasEditing =
        editingNewsId !== null;

    button.disabled =
        true;

    button.textContent =
        wasEditing
            ? "수정 중..."
            : "등록 중...";

    let uploaded =
        [];

    try {

        if (wasEditing) {

            const {
                data: oldNews,
                error: oldError
            } =
                await supabaseClient
                    .from("news")
                    .select(
                        "image_urls"
                    )
                    .eq(
                        "id",
                        editingNewsId
                    )
                    .single();

            if (oldError) {
                throw oldError;
            }

            for (
                const file of files
            ) {

                const path =
                    `${currentUser.id}/${createSafeFileName(
                        file.name
                    )}`;

                const {
                    error
                } =
                    await supabaseClient
                        .storage
                        .from(
                            NEWS_IMAGE_BUCKET
                        )
                        .upload(
                            path,
                            file,
                            {
                                cacheControl:
                                    "3600",

                                upsert:
                                    false,

                                contentType:
                                    file.type
                            }
                        );

                if (error) {
                    throw error;
                }

                uploaded.push(
                    path
                );
            }

            const updateData = {
                title,
                content
            };

            /*
                새 사진을 선택한 경우에만
                기존 사진을 교체.
            */

            if (files.length) {
                updateData.image_urls =
                    uploaded;
            }

            const {
                error
            } =
                await supabaseClient
                    .from("news")
                    .update(
                        updateData
                    )
                    .eq(
                        "id",
                        editingNewsId
                    );

            if (error) {
                throw error;
            }

            if (
                files.length &&
                Array.isArray(
                    oldNews?.image_urls
                )
            ) {
                await deleteUploadedImages(
                    oldNews.image_urls
                );
            }

            const id =
                editingNewsId;

            closeWriteMode();

            await openNewsDetail(
                id,
                false
            );

        } else {

            const {
                data: profile,
                error: profileError
            } =
                await supabaseClient
                    .from("profiles")
                    .select(
                        "username, can_manage_news"
                    )
                    .eq(
                        "id",
                        currentUser.id
                    )
                    .maybeSingle();

            if (profileError) {
                throw profileError;
            }

            if (
                !profile ||
                profile.can_manage_news !==
                    true
            ) {
                throw new Error(
                    "관리자 권한이 없습니다."
                );
            }

            for (
                const file of files
            ) {

                const path =
                    `${currentUser.id}/${createSafeFileName(
                        file.name
                    )}`;

                const {
                    error
                } =
                    await supabaseClient
                        .storage
                        .from(
                            NEWS_IMAGE_BUCKET
                        )
                        .upload(
                            path,
                            file,
                            {
                                cacheControl:
                                    "3600",

                                upsert:
                                    false,

                                contentType:
                                    file.type
                            }
                        );

                if (error) {
                    throw error;
                }

                uploaded.push(
                    path
                );
            }

            const {
                error
            } =
                await supabaseClient
                    .from("news")
                    .insert({
                        author:
                            profile.username,

                        title,

                        content,

                        image_urls:
                            uploaded
                    });

            if (error) {
                throw error;
            }

            closeWriteMode();

            await openNewsList();
        }

    } catch (error) {

        await deleteUploadedImages(
            uploaded
        );

        console.error(
            "소식 저장 오류:",
            error
        );

        alert(
            "소식 저장 중 오류가 발생했습니다.\n" +
            error.message
        );

    } finally {

        button.disabled =
            false;

        /*
            editingNewsId가 closeWriteMode()
            때문에 null이 될 수 있으므로
            wasEditing을 사용.
        */

        button.textContent =
            wasEditing
                ? "수정 저장"
                : "소식 등록";
    }
}


/* =========================
   소식 삭제
========================= */

async function deleteCurrentNews() {
    if (
        !currentUser ||
        !isAdmin ||
        !currentNewsId
    ) {
        return;
    }

    const confirmed =
        window.confirm(
            "정말 이 소식을 삭제하시겠습니까?"
        );

    if (!confirmed) {
        return;
    }

    const {
        data: news,
        error: newsError
    } =
        await supabaseClient
            .from("news")
            .select(
                "image_urls"
            )
            .eq(
                "id",
                currentNewsId
            )
            .single();

    if (newsError) {

        alert(
            "삭제할 소식을 불러오지 못했습니다.\n" +
            newsError.message
        );

        return;
    }

    const {
        error
    } =
        await supabaseClient
            .from("news")
            .delete()
            .eq(
                "id",
                currentNewsId
            );

    if (error) {

        alert(
            "소식 삭제 오류:\n" +
            error.message
        );

        return;
    }

    await deleteUploadedImages(
        Array.isArray(
            news?.image_urls
        )
            ? news.image_urls
            : []
    );

    currentNewsId =
        null;

    await openNewsList();
}


/* =========================
   이벤트
========================= */

$("show-news-list")
    ?.addEventListener(
        "click",
        openNewsList
    );


$("show-write")
    ?.addEventListener(
        "click",
        openWriteScreen
    );


$("back-to-list")
    ?.addEventListener(
        "click",
        openNewsList
    );


$("back-from-write")
    ?.addEventListener(
        "click",
        () => {
            closeWriteMode();
            openNewsList();
        }
    );


$("cancel-write")
    ?.addEventListener(
        "click",
        () => {
            closeWriteMode();
            openNewsList();
        }
    );


$("save-write")
    ?.addEventListener(
        "click",
        saveNews
    );


$("delete-news")
    ?.addEventListener(
        "click",
        deleteCurrentNews
    );


newsMenu?.addEventListener(
    "click",
    openNewsIntro
);


donationMenu?.addEventListener(
    "click",
    openDonation
);


advancedNewsMenu?.addEventListener(
    "click",
    openAdvancedNews
);


videoPreviewMenu?.addEventListener(
    "click",
    openVideoPreview
);


accountButton?.addEventListener(
    "click",
    handleAccountButton
);


loginInfoButton?.addEventListener(
    "click",
    openLoginInfo
);


closeLoginInfo?.addEventListener(
    "click",
    closeLoginInfoModal
);


loginInfoModal?.addEventListener(
    "click",
    event => {
        if (
            event.target ===
            loginInfoModal
        ) {
            closeLoginInfoModal();
        }
    }
);


loginTab?.addEventListener(
    "click",
    () => {
        showAuthMode(
            "login"
        );
    }
);


signupTab?.addEventListener(
    "click",
    () => {
        showAuthMode(
            "signup"
        );
    }
);


$("login-submit")
    ?.addEventListener(
        "click",
        login
    );


$("signup-submit")
    ?.addEventListener(
        "click",
        signup
    );


$("auth-cancel")
    ?.addEventListener(
        "click",
        openNewsIntro
    );


$("login-password")
    ?.addEventListener(
        "keydown",
        event => {
            if (
                event.key ===
                "Enter"
            ) {
                login();
            }
        }
    );


$("signup-password-confirm")
    ?.addEventListener(
        "keydown",
        event => {
            if (
                event.key ===
                "Enter"
            ) {
                signup();
            }
        }
    );


imageInput?.addEventListener(
    "change",
    handleImageSelection
);


likeButton?.addEventListener(
    "click",
    toggleLike
);


commentInput?.addEventListener(
    "input",
    updateCommentLength
);


commentSubmit?.addEventListener(
    "click",
    submitComment
);


commentInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
                "Enter" &&
            (
                event.ctrlKey ||
                event.metaKey
            )
        ) {

            event.preventDefault();

            submitComment();
        }
    }
);


/* =========================
   Supabase 인증 상태
========================= */

supabaseClient.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        if (
            event ===
            "SIGNED_OUT"
        ) {

            currentUser =
                null;

            currentProfile =
                null;

            isAdmin =
                false;

            updateAuthUI();

            if (currentNewsId) {
                await renderNewsInteractions(
                    currentNewsId
                );
            }

            return;
        }

        if (
            session?.user
        ) {

            currentUser =
                session.user;

            await loadCurrentProfile();

            if (currentNewsId) {
                await renderNewsInteractions(
                    currentNewsId
                );
            }
        }
    }
);


/* =========================
   초기화
========================= */

(async function initialize() {

    await refreshAuthState();

    updateAuthUI();

    renderImagePreview();

    openNewsIntro();

})();
