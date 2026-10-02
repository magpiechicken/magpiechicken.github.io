"use strict";

// Updated: category menus, admin-only video preview, intro-first navigation,
// community intro, comment usernames, role colors, large video uploads

const SUPABASE_URL =
    "https://kxrjevmxayolcqcgmixz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_KrmPM2G4nuS1JXOAvnp-cA_Ik1nuYqS";

const NEWS_IMAGE_BUCKET =
    "news-images";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const VIDEO_BUCKET =
    "video-preview";

const MAX_VIDEO_SIZE =
    5 * 1024 * 1024 * 1024;

const SUPABASE_PROJECT_ID =
    "kxrjevmxayolcqcgmixz";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

let currentUser = null;
let currentProfile = null;
let isAdmin = false;
let isMembership = false;
let currentNewsId = null;
let selectedImageFiles = [];
let editingNewsId = null;
let currentCategory = "general";

const homeScreen =
    document.getElementById("screen-home");

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

const membershipScreen =
    document.getElementById("screen-membership");

const adminCommunityScreen =
    document.getElementById("screen-admin-community");

const advancedNewsScreen =
    document.getElementById("screen-advanced-news");

const videoPreviewScreen =
    document.getElementById("screen-video-preview");

const videoTitleInput =
    document.getElementById("video-title-input");

const videoDescriptionInput =
    document.getElementById("video-description-input");

const videoFileInput =
    document.getElementById("video-file-input");

const videoFileName =
    document.getElementById("video-file-name");

const videoUploadButton =
    document.getElementById("video-upload-button");

const videoUploadStatus =
    document.getElementById("video-upload-status");

const videoUploadProgressWrap =
    document.getElementById("video-upload-progress-wrap");

const videoUploadProgressBar =
    document.getElementById("video-upload-progress-bar");

const videoUploadProgressText =
    document.getElementById("video-upload-progress-text");

const videoUploadBox =
    document.querySelector(".video-preview-upload-box");

const videoPreviewList =
    document.getElementById("video-preview-list");

const homeMenu =
    document.getElementById("menu-home");

const newsMenu =
    document.getElementById("menu-news");

const donationMenu =
    document.getElementById("menu-donation");

const membershipMenu =
    document.getElementById("menu-membership");

const sportsNewsMenu =
    document.getElementById("menu-sports-news");

const adminCommunityMenu =
    document.getElementById("menu-admin-community");

const advancedNewsMenu =
    document.getElementById("menu-advanced-news");

const videoPreviewMenu =
    document.getElementById("menu-video-preview");

const menuToggle =
    document.getElementById("menu-toggle");

const sidebar =
    document.querySelector(".sidebar");

const sidebarOverlay =
    document.getElementById("sidebar-overlay");

const accountButton =
    document.getElementById("accountButton");

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

const communityMessages =
    document.getElementById("community-messages");

const communityMessageInput =
    document.getElementById("community-message-input");

const communityMessageLength =
    document.getElementById("community-message-length");

const communitySendButton =
    document.getElementById("community-send-button");

const communityReadonlyNotice =
    document.getElementById("community-readonly-notice");

const membershipCurrentStatus =
    document.getElementById("membership-current-status");

const membershipWebsiteNickname =
    document.getElementById("membership-website-nickname");

const membershipYoutubeHandle =
    document.getElementById("membership-youtube-handle");

const membershipScreenshotInput =
    document.getElementById("membership-screenshot-input");

const membershipScreenshotPreview =
    document.getElementById("membership-screenshot-preview");

const membershipSubmitButton =
    document.getElementById("membership-submit-button");

const membershipAdminPanel =
    document.getElementById("membership-admin-panel");

const membershipAdminList =
    document.getElementById("membership-admin-list");

const membershipAdminRefresh =
    document.getElementById("membership-admin-refresh");

let communityPollTimer = null;
let communityInitialLoad = true;

function closeSidebarDrawer() {
    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("open");
        sidebarOverlay.setAttribute("aria-hidden", "true");
    }

    if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "메뉴 열기");
    }
}

function toggleSidebarDrawer() {
    if (!sidebar || !sidebarOverlay) {
        return;
    }

    const willOpen =
        !sidebar.classList.contains("open");

    sidebar.classList.toggle("open", willOpen);
    sidebarOverlay.classList.toggle("open", willOpen);

    sidebarOverlay.setAttribute(
        "aria-hidden",
        willOpen ? "false" : "true"
    );

    if (menuToggle) {
        menuToggle.setAttribute(
            "aria-expanded",
            String(willOpen)
        );

        menuToggle.setAttribute(
            "aria-label",
            willOpen ? "메뉴 닫기" : "메뉴 열기"
        );
    }
}

function hideAllScreens() {
    closeSidebarDrawer();
    stopCommunityPolling();

    if (homeScreen) {
        homeScreen.classList.remove("visible");
    }

    if (introScreen) {
        introScreen.classList.remove("visible");
    }

    if (listScreen) {
        listScreen.classList.remove("visible");
    }

    if (detailScreen) {
        detailScreen.classList.remove("visible");
    }

    if (writeScreen) {
        writeScreen.classList.remove("visible");
    }

    if (authScreen) {
        authScreen.classList.remove("visible");
    }

    if (donationScreen) {
        donationScreen.classList.remove("visible");
    }

    if (membershipScreen) {
        membershipScreen.classList.remove("visible");
    }

    if (adminCommunityScreen) {
        adminCommunityScreen.classList.remove("visible");
    }

    if (advancedNewsScreen) {
        advancedNewsScreen.classList.remove("visible");
    }

    if (videoPreviewScreen) {
        videoPreviewScreen.classList.remove("visible");
    }
}

function clearMenuActive() {
    [
        homeMenu,
        newsMenu,
        sportsNewsMenu,
        adminCommunityMenu,
        donationMenu,
        membershipMenu,
        advancedNewsMenu,
        videoPreviewMenu
    ].forEach(function(menu) {
        if (menu) {
            menu.classList.remove("active");
        }
    });
}

function activateHomeMenu() {
    closeSidebarDrawer();
    clearMenuActive();

    if (homeMenu) {
        homeMenu.classList.add("active");
    }
}

function activateNewsMenu() {
    closeSidebarDrawer();
    clearMenuActive();

    if (newsMenu) {
        newsMenu.classList.add("active");
    }
}

function activateDonationMenu() {
    closeSidebarDrawer();
    clearMenuActive();

    if (donationMenu) {
        donationMenu.classList.add("active");
    }
}

function activateMembershipMenu() {
    closeSidebarDrawer();
    clearMenuActive();

    if (membershipMenu) {
        membershipMenu.classList.add("active");
    }
}

function activateSportsNewsMenu() {
    closeSidebarDrawer();
    clearMenuActive();

    if (sportsNewsMenu) {
        sportsNewsMenu.classList.add("active");
    }
}

function activateAdminCommunityMenu() {
    closeSidebarDrawer();
    clearMenuActive();

    if (adminCommunityMenu) {
        adminCommunityMenu.classList.add("active");
    }
}

function activateAdvancedNewsMenu() {
    closeSidebarDrawer();
    clearMenuActive();

    if (advancedNewsMenu) {
        advancedNewsMenu.classList.add("active");
    }
}

function activateVideoPreviewMenu() {
    closeSidebarDrawer();
    clearMenuActive();

    if (videoPreviewMenu) {
        videoPreviewMenu.classList.add("active");
    }
}

function updateAdminOnlyMenus() {
    const canUseMembership =
        isAdmin || isMembership;

    if (advancedNewsMenu) {
        if (canUseMembership) {
            advancedNewsMenu.disabled = false;
            advancedNewsMenu.classList.remove("locked");
            advancedNewsMenu.textContent = "고급소식";
        } else {
            advancedNewsMenu.disabled = true;
            advancedNewsMenu.classList.add("locked");
            advancedNewsMenu.textContent = "고급소식 🔒";
        }
    }

    if (videoPreviewMenu) {
        if (canUseMembership) {
            videoPreviewMenu.disabled = false;
            videoPreviewMenu.classList.remove("locked");
            videoPreviewMenu.textContent = "영상미리보기";
        } else {
            videoPreviewMenu.disabled = true;
            videoPreviewMenu.classList.add("locked");
            videoPreviewMenu.textContent = "영상미리보기 🔒";
        }
    }
}

function updateVideoUploadUI() {
    const adminCanUpload =
        isAdmin === true;

    if (videoUploadBox) {
        videoUploadBox.classList.toggle(
            "hidden",
            !adminCanUpload
        );
    }

    if (videoUploadButton) {
        videoUploadButton.disabled =
            !adminCanUpload;
    }

    if (videoFileInput) {
        videoFileInput.disabled =
            !adminCanUpload;
    }

    if (
        videoUploadStatus &&
        !adminCanUpload
    ) {
        videoUploadStatus.textContent =
            "관리자만 영상을 업로드할 수 있습니다. 멤버십 인증 회원은 시청만 가능합니다.";

        videoUploadStatus.classList.remove(
            "error",
            "success"
        );
    }
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
    updateVideoUploadUI();
    updateCommunityComposer();

    if (
        membershipAdminPanel &&
        !isAdmin
    ) {
        membershipAdminPanel.classList.add("hidden");
    }

    if (!currentUser) {
        if (accountButton) {
            accountButton.textContent =
                "로그인";

            accountButton.classList.remove(
                "logged-in"
            );
        }

        if (showWriteButton) {
            showWriteButton.classList.add(
                "hidden"
            );
        }

        if (deleteNewsButton) {
            deleteNewsButton.classList.add(
                "hidden"
            );
        }

        return;
    }

    const username =
        currentProfile?.username ||
        currentUser.email ||
        "회원";

    if (isAdmin) {
        if (accountButton) {
            accountButton.textContent =
                `${username} · 관리자`;

            accountButton.classList.add(
                "logged-in"
            );
        }

        if (showWriteButton) {
            showWriteButton.classList.remove(
                "hidden"
            );
        }

        if (deleteNewsButton) {
            if (currentNewsId !== null) {
                deleteNewsButton.classList.remove(
                    "hidden"
                );
            } else {
                deleteNewsButton.classList.add(
                    "hidden"
                );
            }
        }

        return;
    }

    if (accountButton) {
        accountButton.textContent =
            `${username} · 로그아웃`;

        accountButton.classList.remove(
            "logged-in"
        );
    }

    if (showWriteButton) {
        showWriteButton.classList.add(
            "hidden"
        );
    }

    if (deleteNewsButton) {
        deleteNewsButton.classList.add(
            "hidden"
        );
    }
}

async function loadCurrentProfile() {
    if (!currentUser) {
        currentProfile = null;
        isAdmin = false;
        isMembership = false;

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
                "id, username, can_manage_news, membership_verified"
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
        isMembership = false;

        updateAuthUI();
        return;
    }

    currentProfile =
        profile || null;

    isAdmin =
        profile?.can_manage_news === true;

    isMembership =
        profile?.membership_verified === true;

    updateAuthUI();
}

async function refreshAuthState() {
    try {
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
            isMembership = false;

            if (membershipAdminPanel) {
                membershipAdminPanel.classList.add(
                    "hidden"
                );
            }

            updateAuthUI();
            return;
        }

        currentUser =
            data.user;

        await loadCurrentProfile();

    } catch (error) {
        console.error(
            "인증 상태 확인 오류:",
            error
        );

        currentUser = null;
        currentProfile = null;
        isAdmin = false;
        isMembership = false;

        updateAuthUI();
    }
}

function resetDetailUI() {
    currentNewsId = null;

    if (detailImages) {
        detailImages.classList.add("hidden");
        detailImages.innerHTML = "";
    }

    if (newsInteractions) {
        newsInteractions.classList.add("hidden");
    }

    if (commentsContainer) {
        commentsContainer.innerHTML = "";
    }

    if (commentInput) {
        commentInput.value = "";
    }

    updateCommentLength();
}

function categoryName(category) {
    if (category === "sports") {
        return "스포츠소식";
    }

    if (category === "advanced") {
        return "고급소식";
    }

    return "소식";
}

async function renderIntroRecentNews(
    category = currentCategory
) {
    const container =
        document.getElementById(
            "intro-recent-news"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="intro-recent-loading">
            최근 소식을 불러오는 중...
        </div>
    `;

    try {
        const {
            data: newsList,
            error
        } =
            await supabaseClient
                .from("news")
                .select(
                    "id, author, title, created_at, category"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(30);

        if (error) {
            console.error(
                "소개 화면 최근 소식 조회 오류:",
                error
            );

            container.innerHTML = `
                <div class="intro-recent-empty">
                    최근 소식을 불러오지 못했습니다.
                </div>
            `;

            return;
        }

        const rows =
            Array.isArray(newsList)
                ? newsList
                : [];

        const filtered =
            rows
                .filter(function(news) {
                    const newsCategory =
                        news.category ||
                        "general";

                    if (category === "advanced") {
                        return newsCategory === "advanced";
                    }

                    if (category === "sports") {
                        return newsCategory === "sports";
                    }

                    if (category === "community") {
                        return (
                            newsCategory === "general" ||
                            newsCategory === "sports"
                        );
                    }

                    return newsCategory === "general";
                })
                .slice(0, 3);

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="intro-recent-empty">
                    아직 등록된 소식이 없습니다.
                </div>
            `;

            return;
        }

        container.innerHTML =
            filtered
                .map(function(news, index) {
                    const categoryLabel =
                        categoryName(
                            news.category ||
                            "general"
                        );

                    return `
                        <button
                            class="intro-recent-card"
                            type="button"
                            data-intro-news-id="${escapeAttribute(String(news.id))}"
                        >
                            <span class="intro-recent-number">
                                ${String(index + 1).padStart(2, "0")}
                            </span>

                            <span class="intro-recent-card-main">
                                <span class="intro-recent-card-meta">
                                    ${escapeHTML(categoryLabel)} · ${escapeHTML(formatDate(news.created_at))}
                                </span>

                                <strong class="intro-recent-card-title">
                                    ${escapeHTML(news.title || "제목 없음")}
                                </strong>

                                <span class="intro-recent-card-author">
                                    ${escapeHTML(news.author || "작성자 없음")}
                                </span>
                            </span>

                            <span class="intro-recent-arrow">
                                →
                            </span>
                        </button>
                    `;
                })
                .join("");

        container
            .querySelectorAll(
                "[data-intro-news-id]"
            )
            .forEach(function(button) {
                button.addEventListener(
                    "click",
                    function() {
                        openNewsDetail(
                            button.dataset.introNewsId
                        );
                    }
                );
            });

    } catch (error) {
        console.error(
            "소개 화면 최근 소식 예외:",
            error
        );

        container.innerHTML = `
            <div class="intro-recent-empty">
                최근 소식을 불러오지 못했습니다.
            </div>
        `;
    }
}

function activateCategoryMenu(category) {
    if (category === "sports") {
        activateSportsNewsMenu();
    } else if (category === "advanced") {
        activateAdvancedNewsMenu();
    } else if (category === "community") {
        activateAdminCommunityMenu();
    } else {
        activateNewsMenu();
    }
}

async function renderHomeDashboard() {
    const recentContainer =
        document.getElementById(
            "home-recent-news"
        );

    const popularContainer =
        document.getElementById(
            "home-popular-news"
        );

    if (
        !recentContainer ||
        !popularContainer
    ) {
        return;
    }

    recentContainer.innerHTML =
        '<div class="home-loading">최근 소식을 불러오는 중...</div>';

    popularContainer.innerHTML =
        '<div class="home-loading">많이 본 소식을 불러오는 중...</div>';

    const publicCategories =
        [
            "general",
            "sports"
        ];

    const [
        recentResult,
        popularResult
    ] =
        await Promise.all([
            supabaseClient
                .from("news")
                .select(
                    "id, author, title, created_at, view_count, category"
                )
                .in(
                    "category",
                    publicCategories
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(3),

            supabaseClient
                .from("news")
                .select(
                    "id, author, title, created_at, view_count, category"
                )
                .in(
                    "category",
                    publicCategories
                )
                .order(
                    "view_count",
                    {
                        ascending: false
                    }
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(3)
        ]);

    if (recentResult.error) {
        console.error(
            "홈 최근 소식 조회 오류:",
            recentResult.error
        );
    }

    if (popularResult.error) {
        console.error(
            "홈 인기 소식 조회 오류:",
            popularResult.error
        );
    }

    renderHomeNewsList(
        recentContainer,
        recentResult.data || [],
        "최근 등록된 소식이 없습니다."
    );

    renderHomeNewsList(
        popularContainer,
        popularResult.data || [],
        "조회된 소식이 없습니다."
    );
}

function renderHomeNewsList(
    container,
    newsList,
    emptyMessage
) {
    if (
        !newsList ||
        newsList.length === 0
    ) {
        container.innerHTML = `
            <div class="home-empty">
                ${escapeHTML(emptyMessage)}
            </div>
        `;

        return;
    }

    container.innerHTML =
        newsList
            .map(function(news, index) {
                const category =
                    news.category ||
                    "general";

                const categoryLabel =
                    categoryName(category);

                const viewCount =
                    Number(news.view_count) || 0;

                return `
                    <button
                        class="home-news-item"
                        type="button"
                        data-home-news-id="${escapeHTML(String(news.id))}"
                    >
                        <span class="home-news-rank">
                            ${String(index + 1).padStart(2, "0")}
                        </span>

                        <span class="home-news-main">
                            <span class="home-news-meta">
                                ${escapeHTML(categoryLabel)} · ${escapeHTML(formatDate(news.created_at))}
                            </span>

                            <strong>
                                ${escapeHTML(news.title || "제목 없음")}
                            </strong>

                            <span class="home-news-author">
                                ${escapeHTML(news.author || "작성자 없음")}
                            </span>
                        </span>

                        <span class="home-news-views">
                            ${viewCount.toLocaleString("ko-KR")}회
                        </span>
                    </button>
                `;
            })
            .join("");

    container
        .querySelectorAll(
            "[data-home-news-id]"
        )
        .forEach(function(button) {
            button.addEventListener(
                "click",
                function() {
                    openNewsDetail(
                        button.dataset.homeNewsId
                    );
                }
            );
        });
}

async function openHome() {
    hideAllScreens();

    if (homeScreen) {
        homeScreen.classList.add("visible");
    }

    currentCategory = null;

    activateHomeMenu();
    resetDetailUI();
    updateAuthUI();
    scrollTop();

    await renderHomeDashboard();
}

function openNewsIntro() {
    openCategoryIntro("general");
}

function openCategoryIntro(category) {
    currentCategory = category;

    hideAllScreens();

    if (introScreen) {
        introScreen.classList.add("visible");
    }

    activateCategoryMenu(category);

    const heading =
        introScreen?.querySelector(
            ".page-heading"
        );

    const introTitle =
        introScreen?.querySelector(
            ".intro-box h2"
        );

    const introText =
        introScreen?.querySelector(
            ".intro-box p"
        );

    const detailButton =
        document.getElementById(
            "show-news-list"
        );

    if (category === "sports") {
        if (heading) {
            heading.textContent =
                "스포츠소식";
        }

        if (introTitle) {
            introTitle.textContent =
                "까치치킨사장님 스포츠소식";
        }

        if (introText) {
            introText.textContent =
                "스포츠 관련 새로운 소식과 공지사항이 이곳에 표시됩니다.";
        }

        if (detailButton) {
            detailButton.textContent =
                "스포츠소식 자세히 보러가기";
        }

    } else if (category === "advanced") {
        if (heading) {
            heading.textContent =
                "고급소식";
        }

        if (introTitle) {
            introTitle.textContent =
                "까치치킨사장님 고급소식";
        }

        if (introText) {
            introText.textContent =
                "관리자 전용 고급소식과 공지사항이 이곳에 표시됩니다.";
        }

        if (detailButton) {
            detailButton.textContent =
                "고급소식 자세히 보러가기";
        }

    } else if (category === "community") {
        if (heading) {
            heading.textContent =
                "관리자 커뮤니티";
        }

        if (introTitle) {
            introTitle.textContent =
                "관리자 커뮤니티 안내";
        }

        if (introText) {
            introText.textContent =
                "일반 방문자는 내용을 볼 수 있고, 관리자만 채팅할 수 있습니다.";
        }

        if (detailButton) {
            detailButton.textContent =
                "관리자 커뮤니티 자세히 보러가기";
        }

    } else {
        if (heading) {
            heading.textContent =
                "소식";
        }

        if (introTitle) {
            introTitle.textContent =
                "까치치킨사장님 공식 소식";
        }

        if (introText) {
            introText.textContent =
                "새로운 소식과 공지사항이 이곳에 표시됩니다.";
        }

        if (detailButton) {
            detailButton.textContent =
                "소식 자세히 보러가기";
        }
    }

    resetDetailUI();
    updateAuthUI();

    renderIntroRecentNews(category);
    scrollTop();
}

async function openCategoryList(
    category
) {
    currentCategory = category;

    hideAllScreens();

    if (listScreen) {
        listScreen.classList.add("visible");
    }

    activateCategoryMenu(category);
    resetDetailUI();
    updateAuthUI();

    const heading =
        listScreen?.querySelector(
            ".page-heading"
        );

    if (heading) {
        heading.textContent =
            categoryName(category);
    }

    const subtitle =
        listScreen?.querySelector(
            ".page-subtitle"
        );

    if (subtitle) {
        subtitle.textContent =
            category === "sports"
                ? "스포츠 관련 소식과 공지사항입니다."
                : category === "advanced"
                    ? "멤버십 전용 고급소식입니다."
                    : "까치치킨사장님의 소식과 공지사항입니다.";
    }

    scrollTop();

    await renderNews(category);
}

async function openNewsList() {
    await openCategoryList(
        "general"
    );
}

async function openSportsNews() {
    openCategoryIntro("sports");
}

async function openAdvancedNews() {
    if (!currentUser) {
        alert(
            "고급소식은 멤버십 인증 후 이용할 수 있습니다."
        );

        openAuthScreen("login");
        return;
    }

    if (!isAdmin && !isMembership) {
        alert(
            "고급소식은 멤버십 인증 완료 후 이용할 수 있습니다."
        );

        openMembership();
        return;
    }

    openCategoryIntro("advanced");
}

function openAdminCommunity() {
    openCategoryIntro(
        "community"
    );
}

async function openAdminCommunityChat() {
    hideAllScreens();

    if (!adminCommunityScreen) {
        return;
    }

    adminCommunityScreen.classList.add(
        "visible"
    );

    activateAdminCommunityMenu();
    updateCommunityComposer();

    communityInitialLoad = true;

    await loadCommunityMessages();

    startCommunityPolling();
    scrollTop();
}

function stopCommunityPolling() {
    if (communityPollTimer !== null) {
        clearInterval(
            communityPollTimer
        );

        communityPollTimer = null;
    }
}

function startCommunityPolling() {
    stopCommunityPolling();

    communityPollTimer =
        setInterval(
            function() {
                if (
                    adminCommunityScreen &&
                    adminCommunityScreen.classList.contains(
                        "visible"
                    )
                ) {
                    loadCommunityMessages(
                        true
                    );
                }
            },
            3000
        );
}

function updateCommunityMessageLength() {
    if (
        !communityMessageInput ||
        !communityMessageLength
    ) {
        return;
    }

    communityMessageLength.textContent =
        `${communityMessageInput.value.length} / 500`;
}

function updateCommunityComposer() {
    const canChat =
        !!currentUser &&
        isAdmin;

    if (communityMessageInput) {
        communityMessageInput.disabled =
            !canChat;

        if (!canChat) {
            communityMessageInput.value = "";
        }
    }

    if (communitySendButton) {
        communitySendButton.disabled =
            !canChat;
    }

    if (communityMessageLength) {
        updateCommunityMessageLength();
    }

    if (communityReadonlyNotice) {
        communityReadonlyNotice.classList.toggle(
            "hidden",
            !!canChat
        );
    }
}

async function loadCommunityMessages(
    isPolling = false
) {
    if (!communityMessages) {
        return;
    }

    const wasNearBottom =
        communityMessages.scrollHeight -
        communityMessages.scrollTop -
        communityMessages.clientHeight <
        140;

    const {
        data: messages,
        error
    } =
        await supabaseClient
            .from(
                "admin_community_messages"
            )
            .select(
                "id, user_id, username, content, created_at"
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );

    if (error) {
        console.error(
            "관리자 커뮤니티 조회 오류:",
            error
        );

        if (!isPolling) {
            communityMessages.innerHTML = `
                <div class="community-error">
                    커뮤니티를 불러오지 못했습니다.<br>
                    Supabase의 관리자 커뮤니티 SQL을 먼저 실행해주세요.
                </div>
            `;
        }

        return;
    }

    const list =
        messages || [];

    /*
     * 메시지 작성자의 역할 조회
     * 관리자 = admin
     * 멤버십 = membership
     * 일반회원 = user
     */
    const userIds = [
        ...new Set(
            list
                .map(
                    message =>
                        message.user_id
                )
                .filter(Boolean)
        )
    ];

    let roleMap =
        new Map();

    if (userIds.length > 0) {
        const {
            data: profiles,
            error: roleError
        } =
            await supabaseClient
                .rpc(
                    "get_user_roles",
                    {
                        p_user_ids:
                            userIds
                    }
                );

        if (!roleError) {
            roleMap =
                new Map(
                    (
                        profiles || []
                    ).map(
                        profile => [
                            String(profile.id),
                            profile
                        ]
                    )
                );
        } else {
            console.error(
                "커뮤니티 역할 조회 오류:",
                roleError
            );
        }
    }

    if (list.length === 0) {
        communityMessages.innerHTML = `
            <div class="community-empty">
                아직 메시지가 없습니다.
            </div>
        `;
    } else {
        communityMessages.innerHTML =
            list
                .map(
                    function(message) {
                        const mine =
                            currentUser &&
                            String(
                                message.user_id
                            ) ===
                            String(
                                currentUser.id
                            );

                        const profileInfo =
                            roleMap.get(
                                String(
                                    message.user_id
                                )
                            ) || {};

                        const name =
                            message.username ||
                            profileInfo.username ||
                            "회원";

                        const role =
                            profileInfo.role ||
                            "user";

                        const roleClass =
                            role === "admin"
                                ? "admin"
                                : role === "membership"
                                    ? "membership"
                                    : "";

                        return `
                            <div class="community-message ${mine ? "self" : "other"}">
                                <div class="community-name ${roleClass}">
                                    ${escapeHTML(name)}
                                </div>

                                <div class="community-message-row">
                                    <div class="community-bubble">
                                        ${escapeHTML(message.content).replace(/\n/g, "<br>")}
                                    </div>

                                    <span class="community-time">
                                        ${formatDateTime(message.created_at)}
                                    </span>
                                </div>
                            </div>
                        `;
                    }
                )
                .join("");
    }

    if (
        communityInitialLoad ||
        wasNearBottom
    ) {
        communityMessages.scrollTop =
            communityMessages.scrollHeight;
    }

    communityInitialLoad = false;
}

async function sendCommunityMessage() {
    if (
        !currentUser ||
        !isAdmin
    ) {
        alert(
            "관리자만 채팅할 수 있습니다."
        );

        return;
    }

    if (
        !communityMessageInput ||
        !communitySendButton
    ) {
        return;
    }

    const content =
        communityMessageInput.value.trim();

    if (!content) {
        return;
    }

    if (content.length > 500) {
        alert(
            "메시지는 500자 이내로 입력해주세요."
        );

        return;
    }

    communitySendButton.disabled =
        true;

    communitySendButton.textContent =
        "전송 중...";

    try {
        const username =
            currentProfile?.username ||
            currentUser.email ||
            "관리자";

        const {
            error
        } =
            await supabaseClient
                .from(
                    "admin_community_messages"
                )
                .insert({
                    user_id:
                        currentUser.id,
                    username:
                        username,
                    content:
                        content
                });

        if (error) {
            throw error;
        }

        communityMessageInput.value =
            "";

        updateCommunityMessageLength();

        communityInitialLoad =
            true;

        await loadCommunityMessages();

    } catch (error) {
        console.error(
            "관리자 커뮤니티 전송 오류:",
            error
        );

        alert(
            "메시지 전송 오류:\n" +
            error.message
        );

    } finally {
        communitySendButton.disabled =
            !(
                currentUser &&
                isAdmin
            );

        communitySendButton.textContent =
            "전송";
    }
}

function formatFileSize(bytes) {
    if (
        !Number.isFinite(bytes) ||
        bytes < 0
    ) {
        return "0 B";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = [
        "KB",
        "MB",
        "GB",
        "TB"
    ];

    let value =
        bytes / 1024;

    let unitIndex =
        0;

    while (
        value >= 1024 &&
        unitIndex <
            units.length - 1
    ) {
        value /= 1024;
        unitIndex++;
    }

    return `${value.toFixed(
        value >= 10 ? 1 : 2
    )} ${units[unitIndex]}`;
}

function resetVideoUploadUI() {
    if (videoTitleInput) {
        videoTitleInput.value = "";
    }

    if (videoDescriptionInput) {
        videoDescriptionInput.value = "";
    }

    if (videoFileInput) {
        videoFileInput.value = "";
    }

    if (videoFileName) {
        videoFileName.textContent =
            "선택된 영상 없음";
    }

    if (videoUploadStatus) {
        videoUploadStatus.textContent =
            "";

        videoUploadStatus.classList.remove(
            "error",
            "success"
        );
    }

    if (videoUploadProgressWrap) {
        videoUploadProgressWrap.classList.add(
            "hidden"
        );
    }

    if (videoUploadProgressBar) {
        videoUploadProgressBar.style.width =
            "0%";
    }

    if (videoUploadProgressText) {
        videoUploadProgressText.textContent =
            "0%";
    }
}

function setVideoUploadStatus(
    message,
    type = ""
) {
    if (!videoUploadStatus) {
        return;
    }

    videoUploadStatus.textContent =
        message;

    videoUploadStatus.classList.remove(
        "error",
        "success"
    );

    if (type) {
        videoUploadStatus.classList.add(
            type
        );
    }
}

function setVideoUploadProgress(
    percent
) {
    const safePercent =
        Math.max(
            0,
            Math.min(
                100,
                Number(percent) || 0
            )
        );

    if (videoUploadProgressWrap) {
        videoUploadProgressWrap.classList.remove(
            "hidden"
        );
    }

    if (videoUploadProgressBar) {
        videoUploadProgressBar.style.width =
            `${safePercent}%`;
    }

    if (videoUploadProgressText) {
        videoUploadProgressText.textContent =
            `${safePercent.toFixed(0)}%`;
    }
}

function createVideoObjectName(
    file
) {
    const original =
        file.name ||
        "video";

    const dotIndex =
        original.lastIndexOf(".");

    const extension =
        dotIndex >= 0
            ? original
                .slice(dotIndex)
                .toLowerCase()
                .replace(
                    /[^a-z0-9.]/g,
                    ""
                )
            : ".mp4";

    let base =
        dotIndex >= 0
            ? original.slice(
                0,
                dotIndex
            )
            : original;

    base =
        base
            .normalize("NFKC")
            .replace(
                /[^a-zA-Z0-9_-]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            )
            .slice(
                0,
                80
            );

    if (!base) {
        base = "video";
    }

    const random =
        typeof crypto !== "undefined" &&
        crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2)}`;

    return `${currentUser.id}/${Date.now()}-${random}-${base}${extension}`;
}

async function uploadVideoWithTus(
    file,
    objectPath
) {
    if (
        typeof tus === "undefined" ||
        !tus.Upload
    ) {
        throw new Error(
            "대용량 영상 업로드 모듈을 불러오지 못했습니다."
        );
    }

    const {
        data: sessionData,
        error: sessionError
    } =
        await supabaseClient.auth.getSession();

    if (
        sessionError ||
        !sessionData?.session?.access_token
    ) {
        throw new Error(
            "로그인 세션을 확인할 수 없습니다."
        );
    }

    const accessToken =
        sessionData.session.access_token;

    const endpoint =
        `https://${SUPABASE_PROJECT_ID}.storage.supabase.co/storage/v1/upload/resumable`;

    return new Promise(
        function(resolve, reject) {
            const upload =
                new tus.Upload(
                    file,
                    {
                        endpoint,
                        retryDelays: [
                            0,
                            3000,
                            5000,
                            10000,
                            20000
                        ],
                        headers: {
                            authorization:
                                `Bearer ${accessToken}`,
                            "x-upsert":
                                "false"
                        },
                        uploadDataDuringCreation:
                            true,
                        removeFingerprintOnSuccess:
                            true,
                        chunkSize:
                            6 * 1024 * 1024,
                        metadata: {
                            bucketName:
                                VIDEO_BUCKET,
                            objectName:
                                objectPath,
                            contentType:
                                file.type ||
                                "video/mp4",
                            cacheControl:
                                "3600"
                        },
                        onError(error) {
                            reject(error);
                        },
                        onProgress(
                            bytesUploaded,
                            bytesTotal
                        ) {
                            if (
                                bytesTotal >
                                0
                            ) {
                                setVideoUploadProgress(
                                    (
                                        bytesUploaded /
                                        bytesTotal
                                    ) * 100
                                );
                            }
                        },
                        onSuccess() {
                            resolve();
                        }
                    }
                );

            upload
                .findPreviousUploads()
                .then(
                    previousUploads => {
                        if (
                            previousUploads.length >
                            0
                        ) {
                            upload.resumeFromPreviousUpload(
                                previousUploads[0]
                            );
                        }

                        upload.start();
                    }
                )
                .catch(reject);
        }
    );
}

async function loadVideoPreviews() {
    if (!videoPreviewList) {
        return;
    }

    videoPreviewList.innerHTML = `
        <div class="video-empty-box">
            영상을 불러오는 중...
        </div>
    `;

    const {
        data: videos,
        error
    } =
        await supabaseClient
            .from(
                "video_previews"
            )
            .select(
                "id, title, description, storage_path, file_name, file_size, mime_type, created_at"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {
        console.error(
            "영상 목록 조회 오류:",
            error
        );

        videoPreviewList.innerHTML = `
            <div class="video-empty-box video-error-box">
                영상 목록을 불러오지 못했습니다.<br>
                ${escapeHTML(error.message)}
            </div>
        `;

        return;
    }

    if (
        !videos ||
        videos.length === 0
    ) {
        videoPreviewList.innerHTML = `
            <div class="video-empty-box">
                아직 업로드된 영상이 없습니다.
            </div>
        `;

        return;
    }

    const cards = [];

    for (const video of videos) {
        let signedUrl = null;

        const {
            data: signedData,
            error: signedError
        } =
            await supabaseClient
                .storage
                .from(
                    VIDEO_BUCKET
                )
                .createSignedUrl(
                    video.storage_path,
                    60 * 60
                );

        if (!signedError) {
            signedUrl =
                signedData?.signedUrl ||
                null;
        }

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "video-preview-card";

        const dateText =
            video.created_at
                ? formatDate(
                    video.created_at
                )
                : "";

        card.innerHTML = `
            <div class="video-player-wrap">
                ${
                    signedUrl
                        ? `<video class="video-player" controls preload="metadata" playsinline src="${escapeAttribute(signedUrl)}"></video>`
                        : `<div class="video-player-error">영상을 불러오지 못했습니다.</div>`
                }
            </div>

            <div class="video-preview-card-body">
                <div class="video-preview-card-title">
                    ${escapeHTML(
                        video.title
                    )}
                </div>

                ${
                    video.description
                        ? `<div class="video-preview-card-description">${escapeHTML(video.description).replace(/\n/g, "<br>")}</div>`
                        : ""
                }

                <div class="video-preview-card-meta">
                    ${escapeHTML(
                        video.file_name ||
                        "영상"
                    )} · ${formatFileSize(
                        Number(
                            video.file_size
                        ) || 0
                    )}${
                        dateText
                            ? ` · ${escapeHTML(dateText)}`
                            : ""
                    }
                </div>

                ${
                    isAdmin
                        ? `
                            <button
                                type="button"
                                class="video-delete-button"
                                data-video-id="${escapeAttribute(video.id)}"
                                data-video-path="${escapeAttribute(video.storage_path)}"
                            >
                                영상 삭제
                            </button>
                          `
                        : ""
                }
            </div>
        `;

        const deleteButton =
            card.querySelector(
                ".video-delete-button"
            );

        if (deleteButton) {
            deleteButton.addEventListener(
                "click",
                function() {
                    deleteVideoPreview(
                        video.id,
                        video.storage_path
                    );
                }
            );
        }

        cards.push(card);
    }

    videoPreviewList.innerHTML = "";

    cards.forEach(
        card => {
            videoPreviewList.appendChild(
                card
            );
        }
    );
}

async function uploadVideo() {
    if (!currentUser) {
        alert(
            "로그인이 필요합니다."
        );

        openAuthScreen("login");
        return;
    }

    if (!isAdmin) {
        alert(
            "영상 업로드는 관리자만 할 수 있습니다. 멤버십 인증 회원은 시청만 가능합니다."
        );

        return;
    }

    if (
        !videoFileInput ||
        !videoUploadButton
    ) {
        return;
    }

    const file =
        videoFileInput.files?.[0] ||
        null;

    if (!file) {
        setVideoUploadStatus(
            "영상을 먼저 선택해주세요.",
            "error"
        );

        return;
    }

    if (
        file.size >
        MAX_VIDEO_SIZE
    ) {
        setVideoUploadStatus(
            `영상 크기가 5GB를 초과했습니다. 현재 파일: ${formatFileSize(file.size)}`,
            "error"
        );

        return;
    }

    const title =
        videoTitleInput?.value.trim() ||
        file.name;

    if (!title) {
        setVideoUploadStatus(
            "영상 제목을 입력해주세요.",
            "error"
        );

        return;
    }

    const description =
        videoDescriptionInput?.value.trim() ||
        "";

    const objectPath =
        createVideoObjectName(
            file
        );

    videoUploadButton.disabled =
        true;

    videoUploadButton.textContent =
        "업로드 중...";

    setVideoUploadProgress(0);

    setVideoUploadStatus(
        `업로드 준비 중... (${formatFileSize(file.size)})`
    );

    let uploaded = false;

    try {
        await uploadVideoWithTus(
            file,
            objectPath
        );

        uploaded = true;

        setVideoUploadProgress(
            100
        );

        setVideoUploadStatus(
            "영상 업로드 완료. 정보 저장 중..."
        );

        const {
            error: insertError
        } =
            await supabaseClient
                .from(
                    "video_previews"
                )
                .insert({
                    title,
                    description,
                    storage_path:
                        objectPath,
                    file_name:
                        file.name,
                    file_size:
                        file.size,
                    mime_type:
                        file.type ||
                        "video/mp4",
                    created_by:
                        currentUser.id
                });

        if (insertError) {
            await supabaseClient
                .storage
                .from(
                    VIDEO_BUCKET
                )
                .remove([
                    objectPath
                ]);

            uploaded = false;
            throw insertError;
        }

        setVideoUploadStatus(
            "영상이 정상적으로 등록되었습니다.",
            "success"
        );

        resetVideoUploadUI();

        await loadVideoPreviews();

    } catch (error) {
        console.error(
            "영상 업로드 오류:",
            error
        );

        if (!uploaded) {
            setVideoUploadStatus(
                `영상 업로드 오류: ${error?.message || "알 수 없는 오류"}`,
                "error"
            );
        } else {
            setVideoUploadStatus(
                `영상은 업로드됐지만 저장 처리 중 오류가 발생했습니다: ${error?.message || "알 수 없는 오류"}`,
                "error"
            );
        }

    } finally {
        videoUploadButton.disabled =
            false;

        videoUploadButton.textContent =
            "영상 업로드";
    }
}

async function deleteVideoPreview(
    videoId,
    storagePath
) {
    if (
        !currentUser ||
        !isAdmin
    ) {
        alert(
            "관리자만 영상을 삭제할 수 있습니다."
        );

        return;
    }

    if (
        !window.confirm(
            "이 영상을 삭제하시겠습니까?"
        )
    ) {
        return;
    }

    try {
        const {
            error: storageError
        } =
            await supabaseClient
                .storage
                .from(
                    VIDEO_BUCKET
                )
                .remove([
                    storagePath
                ]);

        if (storageError) {
            throw storageError;
        }

        const {
            error: rowError
        } =
            await supabaseClient
                .from(
                    "video_previews"
                )
                .delete()
                .eq(
                    "id",
                    videoId
                );

        if (rowError) {
            throw rowError;
        }

        await loadVideoPreviews();

    } catch (error) {
        console.error(
            "영상 삭제 오류:",
            error
        );

        alert(
            "영상 삭제 오류:\n" +
            (
                error?.message ||
                "알 수 없는 오류"
            )
        );
    }
}

function openVideoPreview() {
    if (!currentUser) {
        alert(
            "영상미리보기는 멤버십 인증 후 이용할 수 있습니다."
        );

        openAuthScreen("login");
        return;
    }

    if (!isAdmin && !isMembership) {
        alert(
            "영상미리보기는 멤버십 인증 완료 후 이용할 수 있습니다."
        );

        openMembership();
        return;
    }

    hideAllScreens();

    if (videoPreviewScreen) {
        videoPreviewScreen.classList.add(
            "visible"
        );
    }

    activateVideoPreviewMenu();
    scrollTop();

    loadVideoPreviews();
}

function openWriteScreen() {
    if (!currentUser) {
        openAuthScreen("login");
        return;
    }

    if (!isAdmin) {
        alert(
            "관리자만 게시물을 작성할 수 있습니다."
        );

        return;
    }

    resetWriteForm();
    editingNewsId = null;

    hideAllScreens();

    if (writeScreen) {
        writeScreen.classList.add(
            "visible"
        );
    }

    activateCategoryMenu(
        currentCategory
    );

    const heading =
        writeScreen?.querySelector(
            ".write-box h1"
        );

    if (heading) {
        heading.textContent =
            `${categoryName(currentCategory)} 작성`;
    }

    scrollTop();
}

async function loadMembershipStatus() {
    if (
        !membershipCurrentStatus ||
        !membershipSubmitButton
    ) {
        return;
    }

    if (!currentUser) {
        membershipCurrentStatus.textContent =
            "로그인 후 멤버십 인증을 신청할 수 있습니다.";

        membershipSubmitButton.disabled =
            true;

        return;
    }

    if (isMembership) {
        membershipCurrentStatus.className =
            "membership-current-status verified";

        membershipCurrentStatus.textContent =
            "✓ 멤버십 인증 완료 · 멤버십 전용 메뉴를 사용할 수 있습니다.";

        membershipSubmitButton.disabled =
            true;
    } else {
        membershipCurrentStatus.className =
            "membership-current-status";

        membershipCurrentStatus.textContent =
            "인증 신청 상태를 확인하는 중...";

        membershipSubmitButton.disabled =
            false;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "membership_requests"
            )
            .select(
                "id, website_nickname, youtube_handle, status, admin_note, created_at, reviewed_at"
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(1)
            .maybeSingle();

    if (error) {
        console.error(
            "멤버십 신청 상태 조회 오류:",
            error
        );

        membershipCurrentStatus.textContent =
            isMembership
                ? "✓ 멤버십 인증 완료"
                : "현재 신청 상태를 불러오지 못했습니다. 다시 시도해주세요.";

        return;
    }

    if (!data) {
        membershipCurrentStatus.className =
            "membership-current-status";

        membershipCurrentStatus.textContent =
            isMembership
                ? "✓ 멤버십 인증 완료"
                : "아직 멤버십 인증 신청을 하지 않았습니다.";

        return;
    }

    if (data.status === "pending") {
        membershipCurrentStatus.className =
            "membership-current-status pending";

        membershipCurrentStatus.innerHTML =
            "⏳ 인증 신청 검토 중입니다.";

        membershipSubmitButton.disabled =
            true;

    } else if (
        data.status === "approved"
    ) {
        membershipCurrentStatus.className =
            "membership-current-status verified";

        membershipCurrentStatus.innerHTML =
            "✓ 멤버십 인증 완료 · 멤버십 전용 메뉴를 사용할 수 있습니다.";

        membershipSubmitButton.disabled =
            true;

    } else {
        membershipCurrentStatus.className =
            "membership-current-status rejected";

        membershipCurrentStatus.textContent =
            data.admin_note
                ? `인증이 반려되었습니다. 관리자 안내: ${data.admin_note}`
                : "인증이 반려되었습니다. 정보를 확인한 뒤 다시 신청해주세요.";

        membershipSubmitButton.disabled =
            false;
    }

    if (
        data.website_nickname &&
        membershipWebsiteNickname
    ) {
        membershipWebsiteNickname.value =
            data.website_nickname;
    }

    if (
        data.youtube_handle &&
        membershipYoutubeHandle
    ) {
        membershipYoutubeHandle.value =
            data.youtube_handle;
    }
}

function previewMembershipScreenshot() {
    if (!membershipScreenshotPreview) {
        return;
    }

    membershipScreenshotPreview.innerHTML =
        "";

    const file =
        membershipScreenshotInput?.files?.[0] ||
        null;

    if (!file) {
        return;
    }

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {
        return;
    }

    const url =
        URL.createObjectURL(file);

    membershipScreenshotPreview.innerHTML = `
        <img
            src="${escapeAttribute(url)}"
            alt="인증 스크린샷 미리보기"
        >
    `;
}

async function submitMembershipRequest() {
    if (!currentUser) {
        openAuthScreen("login");
        return;
    }

    if (isMembership) {
        alert(
            "이미 멤버십 인증이 완료된 계정입니다."
        );

        return;
    }

    const websiteNickname =
        membershipWebsiteNickname?.value.trim() ||
        "";

    const youtubeHandle =
        membershipYoutubeHandle?.value.trim() ||
        "";

    const file =
        membershipScreenshotInput?.files?.[0] ||
        null;

    if (!websiteNickname) {
        alert(
            "웹사이트 닉네임을 입력해주세요."
        );

        membershipWebsiteNickname?.focus();

        return;
    }

    if (!youtubeHandle) {
        alert(
            "유튜브 핸들을 입력해주세요."
        );

        membershipYoutubeHandle?.focus();

        return;
    }

    if (!file) {
        alert(
            "인증 스크린샷을 1장 선택해주세요."
        );

        return;
    }

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {
        alert(
            "이미지 파일만 업로드할 수 있습니다."
        );

        return;
    }

    const MAX_MEMBERSHIP_SCREENSHOT_SIZE =
        10 * 1024 * 1024;

    if (
        file.size >
        MAX_MEMBERSHIP_SCREENSHOT_SIZE
    ) {
        alert(
            "인증 스크린샷은 10MB 이하로 업로드해주세요."
        );

        return;
    }

    membershipSubmitButton.disabled =
        true;

    membershipSubmitButton.textContent =
        "신청 중...";

    let storagePath = null;

    try {
        const randomPart =
            (
                window.crypto?.randomUUID?.() ||
                String(Date.now())
            );

        const safeName =
            createSafeFileName(
                file.name
            );

        storagePath =
            `${currentUser.id}/${randomPart}-${safeName}`;

        const {
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from(
                    "membership-verification"
                )
                .upload(
                    storagePath,
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

        if (uploadError) {
            throw uploadError;
        }

        const {
            error: insertError
        } =
            await supabaseClient
                .from(
                    "membership_requests"
                )
                .insert({
                    user_id:
                        currentUser.id,
                    website_nickname:
                        websiteNickname,
                    youtube_handle:
                        youtubeHandle,
                    screenshot_path:
                        storagePath
                });

        if (insertError) {
            await supabaseClient
                .storage
                .from(
                    "membership-verification"
                )
                .remove([
                    storagePath
                ]);

            throw insertError;
        }

        membershipCurrentStatus.className =
            "membership-current-status pending";

        membershipCurrentStatus.textContent =
            "⏳ 인증 신청이 완료되었습니다. 관리자의 검토를 기다려주세요.";

        membershipScreenshotInput.value =
            "";

        membershipScreenshotPreview.innerHTML =
            "";

        await loadMembershipStatus();

        alert(
            "멤버십 인증 신청이 완료되었습니다."
        );

    } catch (error) {
        console.error(
            "멤버십 인증 신청 오류:",
            error
        );

        alert(
            "멤버십 인증 신청 오류:\
