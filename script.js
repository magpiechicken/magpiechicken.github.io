"use strict";

// Updated: category menus, admin-only video preview, intro-first navigation, community intro, comment usernames, large video uploads

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

const videoPreviewList =
    document.getElementById("video-preview-list");

const homeMenu =
    document.getElementById("menu-home");

const newsMenu =
    document.getElementById("menu-news");

const donationMenu =
    document.getElementById("menu-donation");

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

    const willOpen = !sidebar.classList.contains("open");

    sidebar.classList.toggle("open", willOpen);
    sidebarOverlay.classList.toggle("open", willOpen);
    sidebarOverlay.setAttribute("aria-hidden", willOpen ? "false" : "true");

    if (menuToggle) {
        menuToggle.setAttribute("aria-expanded", String(willOpen));
        menuToggle.setAttribute("aria-label", willOpen ? "메뉴 닫기" : "메뉴 열기");
    }
}

function hideAllScreens() {
    closeSidebarDrawer();

    stopCommunityPolling();

    if (homeScreen) {
        homeScreen.classList.remove("visible");
    }
    introScreen.classList.remove("visible");
    listScreen.classList.remove("visible");
    detailScreen.classList.remove("visible");
    writeScreen.classList.remove("visible");
    authScreen.classList.remove("visible");
    donationScreen.classList.remove("visible");
    if (adminCommunityScreen) {
        adminCommunityScreen.classList.remove("visible");
    }
    advancedNewsScreen.classList.remove("visible");
    videoPreviewScreen.classList.remove("visible");
}

function clearMenuActive() {
    [
        homeMenu,
        newsMenu,
        sportsNewsMenu,
        adminCommunityMenu,
        donationMenu,
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
    newsMenu.classList.add("active");
}

function activateDonationMenu() {
    closeSidebarDrawer();
    clearMenuActive();
    donationMenu.classList.add("active");
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
    if (advancedNewsMenu) {
        if (isAdmin) {
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
        if (isAdmin) {
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

function scrollTop() {
    const main =
        document.querySelector(".main-content");

    if (main) {
        main.scrollTop = 0;
    }
}

function updateAuthUI() {
    updateAdminOnlyMenus();
    updateCommunityComposer();

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

            updateAuthUI();

            return;
        }

        currentUser =
            data.user;

        /*
         * 프로필 조회 실패만으로 로그인 세션을 취소하지 않습니다.
         * profiles RLS/행 누락이 있어도 로그인 자체는 유지합니다.
         */
        await loadCurrentProfile();
    } catch (error) {
        console.error(
            "인증 상태 확인 오류:",
            error
        );

        currentUser = null;
        currentProfile = null;
        isAdmin = false;

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
    if (category === "sports") return "스포츠소식";
    if (category === "advanced") return "고급소식";
    return "소식";
}

async function renderIntroRecentNews(category = currentCategory) {
    const container = document.getElementById("intro-recent-news");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="intro-recent-loading">
            최근 소식을 불러오는 중...
        </div>
    `;

    /*
     * 공개 화면(소식/스포츠소식/관리자 커뮤니티)은
     * 일반 + 스포츠 글 중 최신 3개를 보여줍니다.
     * 고급소식 화면에서는 관리자 전용 고급소식만 보여줍니다.
     */
    const categories =
        category === "advanced"
            ? ["advanced"]
            : ["general", "sports"];

    const {
        data: newsList,
        error
    } = await supabaseClient
        .from("news")
        .select(
            "id, author, title, created_at, view_count, category"
        )
        .in("category", categories)
        .order("created_at", { ascending: false })
        .limit(3);

    if (error) {
        console.error("소개 화면 최근 소식 조회 오류:", error);

        container.innerHTML = `
            <div class="intro-recent-empty">
                최근 소식을 불러오지 못했습니다.
            </div>
        `;

        return;
    }

    if (!newsList || newsList.length === 0) {
        container.innerHTML = `
            <div class="intro-recent-empty">
                아직 등록된 소식이 없습니다.
            </div>
        `;

        return;
    }

    container.innerHTML = newsList
        .map(function(news, index) {
            const categoryLabel = categoryName(news.category || "general");
            const viewCount = Number(news.view_count) || 0;

            return `
                <button
                    class="intro-recent-card"
                    type="button"
                    data-intro-news-id="${escapeHTML(String(news.id))}"
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
                            ${escapeHTML(news.author || "작성자 없음")} · ${viewCount.toLocaleString("ko-KR")}회
                        </span>
                    </span>

                    <span class="intro-recent-arrow">→</span>
                </button>
            `;
        })
        .join("");

    container
        .querySelectorAll("[data-intro-news-id]")
        .forEach(function(button) {
            button.addEventListener("click", function() {
                openNewsDetail(button.dataset.introNewsId);
            });
        });
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
        document.getElementById("home-recent-news");

    const popularContainer =
        document.getElementById("home-popular-news");

    if (!recentContainer || !popularContainer) {
        return;
    }

    recentContainer.innerHTML =
        '<div class="home-loading">최근 소식을 불러오는 중...</div>';

    popularContainer.innerHTML =
        '<div class="home-loading">많이 본 소식을 불러오는 중...</div>';

    const publicCategories = ["general", "sports"];

    const [recentResult, popularResult] =
        await Promise.all([
            supabaseClient
                .from("news")
                .select(
                    "id, author, title, created_at, view_count, category"
                )
                .in("category", publicCategories)
                .order("created_at", { ascending: false })
                .limit(3),

            supabaseClient
                .from("news")
                .select(
                    "id, author, title, created_at, view_count, category"
                )
                .in("category", publicCategories)
                .order("view_count", { ascending: false })
                .order("created_at", { ascending: false })
                .limit(3)
        ]);

    if (recentResult.error) {
        console.error("홈 최근 소식 조회 오류:", recentResult.error);
    }

    if (popularResult.error) {
        console.error("홈 인기 소식 조회 오류:", popularResult.error);
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
    if (!newsList || newsList.length === 0) {
        container.innerHTML = `
            <div class="home-empty">
                ${escapeHTML(emptyMessage)}
            </div>
        `;
        return;
    }

    container.innerHTML = newsList
        .map(function(news, index) {
            const category = news.category || "general";
            const categoryLabel = categoryName(category);
            const viewCount = Number(news.view_count) || 0;

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
        .querySelectorAll("[data-home-news-id]")
        .forEach(function(button) {
            button.addEventListener("click", function() {
                openNewsDetail(button.dataset.homeNewsId);
            });
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
    introScreen.classList.add("visible");

    activateCategoryMenu(category);

    const heading = introScreen.querySelector(".page-heading");
    const introTitle = introScreen.querySelector(".intro-box h2");
    const introText = introScreen.querySelector(".intro-box p");
    const detailButton = document.getElementById("show-news-list");

    if (category === "sports") {
        if (heading) heading.textContent = "스포츠소식";
        if (introTitle) introTitle.textContent = "까치치킨사장님 스포츠소식";
        if (introText) introText.textContent = "스포츠 관련 새로운 소식과 공지사항이 이곳에 표시됩니다.";
        if (detailButton) detailButton.textContent = "스포츠소식 자세히 보러가기";
    } else if (category === "advanced") {
        if (heading) heading.textContent = "고급소식";
        if (introTitle) introTitle.textContent = "까치치킨사장님 고급소식";
        if (introText) introText.textContent = "관리자 전용 고급소식과 공지사항이 이곳에 표시됩니다.";
        if (detailButton) detailButton.textContent = "고급소식 자세히 보러가기";
    } else if (category === "community") {
        if (heading) heading.textContent = "관리자 커뮤니티";
        if (introTitle) introTitle.textContent = "관리자 커뮤니티 안내";
        if (introText) introText.textContent = "일반 방문자는 내용을 볼 수 있고, 관리자만 채팅할 수 있습니다.";
        if (detailButton) detailButton.textContent = "관리자 커뮤니티 자세히 보러가기";
    } else {
        if (heading) heading.textContent = "소식";
        if (introTitle) introTitle.textContent = "까치치킨사장님 공식 소식";
        if (introText) introText.textContent = "새로운 소식과 공지사항이 이곳에 표시됩니다.";
        if (detailButton) detailButton.textContent = "소식 자세히 보러가기";
    }

    resetDetailUI();
    updateAuthUI();
    renderIntroRecentNews(category);
    scrollTop();
}

async function openCategoryList(category) {
    currentCategory = category;
    hideAllScreens();
    listScreen.classList.add("visible");
    activateCategoryMenu(category);
    resetDetailUI();
    updateAuthUI();

    const heading = listScreen.querySelector(".page-heading");
    if (heading) {
        heading.textContent = categoryName(category);
    }

    const subtitle = listScreen.querySelector(".page-subtitle");
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
    await openCategoryList("general");
}

async function openSportsNews() {
    openCategoryIntro("sports");
}

async function openAdvancedNews() {
    if (!isAdmin) {
        alert("관리자만 고급소식을 이용할 수 있습니다.");
        return;
    }

    openCategoryIntro("advanced");
}

function openAdminCommunity() {
    openCategoryIntro("community");
}

async function openAdminCommunityChat() {
    hideAllScreens();

    if (!adminCommunityScreen) {
        return;
    }

    adminCommunityScreen.classList.add("visible");
    activateAdminCommunityMenu();
    updateCommunityComposer();
    communityInitialLoad = true;

    await loadCommunityMessages();
    startCommunityPolling();
    scrollTop();
}

function stopCommunityPolling() {
    if (communityPollTimer !== null) {
        clearInterval(communityPollTimer);
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
                    adminCommunityScreen.classList.contains("visible")
                ) {
                    loadCommunityMessages(true);
                }
            },
            3000
        );
}

function updateCommunityMessageLength() {
    if (!communityMessageInput || !communityMessageLength) {
        return;
    }

    communityMessageLength.textContent =
        `${communityMessageInput.value.length} / 500`;
}

function updateCommunityComposer() {
    const canChat =
        currentUser &&
        isAdmin;

    if (communityMessageInput) {
        communityMessageInput.disabled = !canChat;
        if (!canChat) {
            communityMessageInput.value = "";
        }
    }

    if (communitySendButton) {
        communitySendButton.disabled = !canChat;
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

async function loadCommunityMessages(isPolling = false) {
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
    } = await supabaseClient
        .from("admin_community_messages")
        .select(
            "id, user_id, username, content, created_at"
        )
        .order(
            "created_at",
            { ascending: true }
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

    const list = messages || [];

    if (list.length === 0) {
        communityMessages.innerHTML = `
            <div class="community-empty">
                아직 메시지가 없습니다.
            </div>
        `;
    } else {
        communityMessages.innerHTML = list
            .map(function(message) {
                const mine =
                    currentUser &&
                    String(message.user_id) ===
                        String(currentUser.id);

                const name =
                    message.username ||
                    "관리자";

                return `
                    <div class="community-message ${mine ? "self" : "other"}">
                        <div class="community-name">
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
            })
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
    if (!currentUser || !isAdmin) {
        alert("관리자만 채팅할 수 있습니다.");
        return;
    }

    if (!communityMessageInput || !communitySendButton) {
        return;
    }

    const content =
        communityMessageInput.value.trim();

    if (!content) {
        return;
    }

    if (content.length > 500) {
        alert("메시지는 500자 이내로 입력해주세요.");
        return;
    }

    communitySendButton.disabled = true;
    communitySendButton.textContent = "전송 중...";

    try {
        const username =
            currentProfile?.username ||
            currentUser.email ||
            "관리자";

        const { error } =
            await supabaseClient
                .from("admin_community_messages")
                .insert({
                    user_id: currentUser.id,
                    username: username,
                    content: content
                });

        if (error) {
            throw error;
        }

        communityMessageInput.value = "";
        updateCommunityMessageLength();
        communityInitialLoad = true;
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
        communitySendButton.disabled = !(currentUser && isAdmin);
        communitySendButton.textContent = "전송";
    }
}

function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) {
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

    let value = bytes / 1024;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
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
        videoFileName.textContent = "선택된 영상 없음";
    }

    if (videoUploadStatus) {
        videoUploadStatus.textContent = "";
        videoUploadStatus.classList.remove("error", "success");
    }

    if (videoUploadProgressWrap) {
        videoUploadProgressWrap.classList.add("hidden");
    }

    if (videoUploadProgressBar) {
        videoUploadProgressBar.style.width = "0%";
    }

    if (videoUploadProgressText) {
        videoUploadProgressText.textContent = "0%";
    }
}

function setVideoUploadStatus(message, type = "") {
    if (!videoUploadStatus) {
        return;
    }

    videoUploadStatus.textContent = message;
    videoUploadStatus.classList.remove("error", "success");

    if (type) {
        videoUploadStatus.classList.add(type);
    }
}

function setVideoUploadProgress(percent) {
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));

    if (videoUploadProgressWrap) {
        videoUploadProgressWrap.classList.remove("hidden");
    }

    if (videoUploadProgressBar) {
        videoUploadProgressBar.style.width = `${safePercent}%`;
    }

    if (videoUploadProgressText) {
        videoUploadProgressText.textContent = `${safePercent.toFixed(0)}%`;
    }
}

function createVideoObjectName(file) {
    const original = file.name || "video";
    const dotIndex = original.lastIndexOf(".");
    const extension = dotIndex >= 0
        ? original.slice(dotIndex).toLowerCase().replace(/[^a-z0-9.]/g, "")
        : ".mp4";

    let base = dotIndex >= 0
        ? original.slice(0, dotIndex)
        : original;

    base = base
        .normalize("NFKC")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

    if (!base) {
        base = "video";
    }

    const random =
        typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return `${currentUser.id}/${Date.now()}-${random}-${base}${extension}`;
}

async function uploadVideoWithTus(file, objectPath) {
    if (typeof tus === "undefined" || !tus.Upload) {
        throw new Error("대용량 영상 업로드 모듈을 불러오지 못했습니다.");
    }

    const {
        data: sessionData,
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError || !sessionData?.session?.access_token) {
        throw new Error("로그인 세션을 확인할 수 없습니다.");
    }

    const accessToken =
        sessionData.session.access_token;

    const endpoint =
        `https://${SUPABASE_PROJECT_ID}.storage.supabase.co/storage/v1/upload/resumable`;

    return new Promise((resolve, reject) => {
        const upload = new tus.Upload(file, {
            endpoint,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            headers: {
                authorization: `Bearer ${accessToken}`,
                "x-upsert": "false"
            },
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true,
            chunkSize: 6 * 1024 * 1024,
            metadata: {
                bucketName: VIDEO_BUCKET,
                objectName: objectPath,
                contentType: file.type || "video/mp4",
                cacheControl: "3600"
            },
            onError(error) {
                reject(error);
            },
            onProgress(bytesUploaded, bytesTotal) {
                if (bytesTotal > 0) {
                    setVideoUploadProgress(
                        (bytesUploaded / bytesTotal) * 100
                    );
                }
            },
            onSuccess() {
                resolve();
            }
        });

        upload.findPreviousUploads()
            .then(previousUploads => {
                if (previousUploads.length > 0) {
                    upload.resumeFromPreviousUpload(previousUploads[0]);
                }

                upload.start();
            })
            .catch(reject);
    });
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
    } = await supabaseClient
        .from("video_previews")
        .select("id, title, description, storage_path, file_name, file_size, mime_type, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("영상 목록 조회 오류:", error);
        videoPreviewList.innerHTML = `
            <div class="video-empty-box video-error-box">
                영상 목록을 불러오지 못했습니다.<br>
                ${escapeHTML(error.message)}
            </div>
        `;
        return;
    }

    if (!videos || videos.length === 0) {
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
        } = await supabaseClient
            .storage
            .from(VIDEO_BUCKET)
            .createSignedUrl(video.storage_path, 60 * 60);

        if (!signedError) {
            signedUrl = signedData?.signedUrl || null;
        }

        const card = document.createElement("article");
        card.className = "video-preview-card";

        const dateText =
            video.created_at
                ? formatDate(video.created_at)
                : "";

        card.innerHTML = `
            <div class="video-player-wrap">
                ${signedUrl
                    ? `<video class="video-player" controls preload="metadata" playsinline src="${escapeAttribute(signedUrl)}"></video>`
                    : `<div class="video-player-error">영상을 불러오지 못했습니다.</div>`
                }
            </div>

            <div class="video-preview-card-body">
                <div class="video-preview-card-title">
                    ${escapeHTML(video.title)}
                </div>

                ${video.description
                    ? `<div class="video-preview-card-description">${escapeHTML(video.description).replace(/\n/g, "<br>")}</div>`
                    : ""
                }

                <div class="video-preview-card-meta">
                    ${escapeHTML(video.file_name || "영상")} · ${formatFileSize(Number(video.file_size) || 0)}${dateText ? ` · ${escapeHTML(dateText)}` : ""}
                </div>

                <button
                    type="button"
                    class="video-delete-button"
                    data-video-id="${escapeAttribute(video.id)}"
                    data-video-path="${escapeAttribute(video.storage_path)}"
                >
                    영상 삭제
                </button>
            </div>
        `;

        const deleteButton =
            card.querySelector(".video-delete-button");

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

    cards.forEach(card => {
        videoPreviewList.appendChild(card);
    });
}

async function uploadVideo() {
    if (!currentUser) {
        alert("로그인이 필요합니다.");
        openAuthScreen("login");
        return;
    }

    if (!isAdmin) {
        alert("관리자만 영상을 업로드할 수 있습니다.");
        return;
    }

    if (!videoFileInput || !videoUploadButton) {
        return;
    }

    const file = videoFileInput.files?.[0] || null;

    if (!file) {
        setVideoUploadStatus("영상을 먼저 선택해주세요.", "error");
        return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
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
        setVideoUploadStatus("영상 제목을 입력해주세요.", "error");
        return;
    }

    const description =
        videoDescriptionInput?.value.trim() ||
        "";

    const objectPath =
        createVideoObjectName(file);

    videoUploadButton.disabled = true;
    videoUploadButton.textContent = "업로드 중...";
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
        setVideoUploadProgress(100);
        setVideoUploadStatus(
            "영상 업로드 완료. 정보 저장 중..."
        );

        const {
            error: insertError
        } = await supabaseClient
            .from("video_previews")
            .insert({
                title,
                description,
                storage_path: objectPath,
                file_name: file.name,
                file_size: file.size,
                mime_type: file.type || "video/mp4",
                created_by: currentUser.id
            });

        if (insertError) {
            await supabaseClient
                .storage
                .from(VIDEO_BUCKET)
                .remove([objectPath]);

            uploaded = false;
            throw insertError;
        }

        setVideoUploadStatus(
            "영상이 정상적으로 등록되었습니다.",
            "success"
        );

        resetVideoUploadUI();

        setVideoUploadStatus(
            "영상이 정상적으로 등록되었습니다.",
            "success"
        );

        await loadVideoPreviews();

    } catch (error) {
        console.error("영상 업로드 오류:", error);

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
        videoUploadButton.disabled = false;
        videoUploadButton.textContent = "영상 업로드";
    }
}

async function deleteVideoPreview(videoId, storagePath) {
    if (!currentUser || !isAdmin) {
        alert("관리자만 영상을 삭제할 수 있습니다.");
        return;
    }

    if (!window.confirm("이 영상을 삭제하시겠습니까?")) {
        return;
    }

    try {
        const { error: storageError } =
            await supabaseClient
                .storage
                .from(VIDEO_BUCKET)
                .remove([storagePath]);

        if (storageError) {
            throw storageError;
        }

        const { error: rowError } =
            await supabaseClient
                .from("video_previews")
                .delete()
                .eq("id", videoId);

        if (rowError) {
            throw rowError;
        }

        await loadVideoPreviews();

    } catch (error) {
        console.error("영상 삭제 오류:", error);
        alert(
            "영상 삭제 오류:\n" +
            (error?.message || "알 수 없는 오류")
        );
    }
}

function openVideoPreview() {
    if (!currentUser) {
        alert("영상미리보기는 관리자만 이용할 수 있습니다.");
        openAuthScreen("login");
        return;
    }

    if (!isAdmin) {
        alert("영상미리보기는 관리자만 이용할 수 있습니다.");
        return;
    }

    hideAllScreens();
    videoPreviewScreen.classList.add("visible");
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
        alert("관리자만 게시물을 작성할 수 있습니다.");
        return;
    }

    resetWriteForm();
    editingNewsId = null;

    hideAllScreens();
    writeScreen.classList.add("visible");
    activateCategoryMenu(currentCategory);

    const heading = writeScreen.querySelector(".write-box h1");
    if (heading) {
        heading.textContent = `${categoryName(currentCategory)} 작성`;
    }

    scrollTop();
}

function openDonation() {
    hideAllScreens();
    donationScreen.classList.add("visible");
    activateDonationMenu();
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

function showAuthMode(mode) {
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

async function handleAccountButton() {
    if (!currentUser) {
        openAuthScreen("login");
        return;
    }

    await logout();
}

async function login() {
    const email =
        document
            .getElementById(
                "login-email"
            )
            .value
            .trim();

    const password =
        document.getElementById(
            "login-password"
        ).value;

    authMessage.textContent = "";

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

    const loginButton =
        document.getElementById(
            "login-submit"
        );

    loginButton.disabled = true;
    loginButton.textContent =
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
            console.error(
                "로그인 오류:",
                error
            );

            authMessage.textContent =
                error.message;

            return;
        }

        currentUser =
            data.user;

        /*
         * 프로필이 없거나 profiles RLS가 잠시 실패해도
         * 로그인 세션 자체는 유지합니다.
         */
        await loadCurrentProfile();

        await openHome();

        authMessage.textContent =
            isAdmin
                ? "관리자 계정으로 로그인되었습니다."
                : "로그인되었습니다.";

    } catch (error) {
        console.error(
            "로그인 예외:",
            error
        );

        authMessage.textContent =
            error.message ||
            "로그인 중 오류가 발생했습니다.";

    } finally {
        loginButton.disabled = false;
        loginButton.textContent =
            "로그인";
    }
}

async function signup() {
    const username =
        document
            .getElementById(
                "signup-username"
            )
            .value
            .trim();

    const email =
        document
            .getElementById(
                "signup-email"
            )
            .value
            .trim();

    const password =
        document.getElementById(
            "signup-password"
        ).value;

    const passwordConfirm =
        document.getElementById(
            "signup-password-confirm"
        ).value;

    authMessage.textContent = "";

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

    if (password !== passwordConfirm) {
        authMessage.textContent =
            "비밀번호가 일치하지 않습니다.";

        return;
    }

    const signupButton =
        document.getElementById(
            "signup-submit"
        );

    signupButton.disabled = true;
    signupButton.textContent =
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
            console.error(
                "회원가입 오류:",
                error
            );

            authMessage.textContent =
                error.message;

            return;
        }

        if (
            data.user &&
            data.session
        ) {
            currentUser =
                data.user;

            await loadCurrentProfile();

            if (!currentProfile) {
                await supabaseClient.auth.signOut();

                currentUser = null;
                currentProfile = null;
                isAdmin = false;

                updateAuthUI();

                authMessage.textContent =
                    "가입은 되었지만 회원 정보를 만들지 못했습니다.";

                return;
            }

            await openNewsIntro();

            return;
        }

        authMessage.textContent =
            "회원가입이 완료되었습니다. 이메일 인증이 필요한 경우 이메일을 확인한 뒤 로그인해주세요.";

        document.getElementById(
            "login-email"
        ).value = email;

        showAuthMode("login");

    } catch (error) {
        console.error(
            "회원가입 예외:",
            error
        );

        authMessage.textContent =
            error.message ||
            "회원가입 중 오류가 발생했습니다.";

    } finally {
        signupButton.disabled = false;
        signupButton.textContent =
            "회원가입";
    }
}

async function logout() {
    const {
        error
    } =
        await supabaseClient.auth.signOut();

    if (error) {
        console.error(
            "로그아웃 오류:",
            error
        );

        return;
    }

    currentUser = null;
    currentProfile = null;
    isAdmin = false;
    currentNewsId = null;

    updateAuthUI();

    openNewsIntro();
}

async function getNews(category = "general") {
    try {
        const {
            data,
            error
        } = await supabaseClient
            .from("news")
            .select(
                "id, author, title, content, created_at, image_urls, view_count, category"
            )
            .eq("category", category)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

        if (error) {
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error(
            `소식 불러오기 오류 [${category}]:`,
            error
        );

        const message =
            error?.message ||
            "알 수 없는 오류";

        const code =
            error?.code
                ? ` [${error.code}]`
                : "";

        const container =
            document.getElementById(
                "news-list-container"
            );

        if (container) {
            container.innerHTML = `
                <div class="empty-box">
                    <div class="empty-title">
                        ${escapeHTML(categoryName(category))}을(를) 불러오지 못했습니다.
                    </div>
                    <div class="empty-description">
                        ${escapeHTML(message + code)}
                        <br>
                        Supabase의 news SELECT 정책과 category 컬럼을 확인해주세요.
                    </div>
                </div>
            `;
        }

        return [];
    }
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
                    p_news_id: newsId
                }
            );

    if (error) {
        console.error(
            "조회수 증가 오류:",
            error
        );
    }
}

async function getNewsInteractionCounts(
    newsList
) {
    const result =
        new Map();

    (newsList || []).forEach(
        function(news) {
            result.set(
                String(news.id),
                {
                    likes: 0,
                    comments: 0
                }
            );
        }
    );

    const ids =
        (newsList || []).map(
            function(news) {
                return news.id;
            }
        );

    if (ids.length === 0) {
        return result;
    }

    const [likesResult, commentsResult] =
        await Promise.all([
            supabaseClient
                .from("news_likes")
                .select("news_id")
                .in("news_id", ids),

            supabaseClient
                .from("news_comments")
                .select("news_id")
                .in("news_id", ids)
        ]);

    if (!likesResult.error) {
        (likesResult.data || []).forEach(
            function(row) {
                const item = result.get(
                    String(row.news_id)
                );

                if (item) {
                    item.likes += 1;
                }
            }
        );
    }

    if (!commentsResult.error) {
        (commentsResult.data || []).forEach(
            function(row) {
                const item = result.get(
                    String(row.news_id)
                );

                if (item) {
                    item.comments += 1;
                }
            }
        );
    }

    return result;
}

async function getReadNewsIds(
    newsList
) {
    if (
        !currentUser ||
        !newsList ||
        newsList.length === 0
    ) {
        return new Set();
    }

    const newsIds =
        newsList.map(
            function(news) {
                return String(
                    news.id
                );
            }
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
                newsIds
            );

    if (error) {
        console.error(
            "읽음 상태 조회 오류:",
            error
        );

        return new Set();
    }

    return new Set(
        (data || []).map(
            function(row) {
                return String(
                    row.news_id
                );
            }
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
                        String(newsId),

                    read_at:
                        new Date().toISOString()
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

function formatDate(value) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return (
        date.getFullYear() +
        "." +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "." +
        String(
            date.getDate()
        ).padStart(2, "0")
    );
}

function getPublicImageUrl(
    path
) {
    if (!path) {
        return null;
    }

    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {
        return path;
    }

    const {
        data
    } =
        supabaseClient.storage
            .from(
                NEWS_IMAGE_BUCKET
            )
            .getPublicUrl(
                path
            );

    return data?.publicUrl || null;
}

async function renderNews(category = currentCategory) {
    const container =
        document.getElementById(
            "news-list-container"
        );

    container.innerHTML = `
        <div class="empty-box">
            <div class="empty-title">
                불러오는 중...
            </div>
        </div>
    `;

    const newsList =
        await getNews(category);

    if (
        newsList.length === 0
    ) {
        container.innerHTML = `
            <div class="empty-box">
                <div class="empty-title">
                    ${categoryName(category)} 없음
                </div>

                <div class="empty-description">
                    현재 등록된 ${categoryName(category)}이(가) 없습니다.
                </div>
            </div>
        `;

        return;
    }

    const readNewsIds =
        await getReadNewsIds(
            newsList
        );

    container.innerHTML = "";

    const list =
        document.createElement(
            "div"
        );

    list.className =
        "news-list";

    newsList.forEach(
        function(news) {

            const newsKey =
                String(news.id);

            const isUnread =
                currentUser &&
                !readNewsIds.has(
                    newsKey
                );

            const row =
                document.createElement(
                    "button"
                );

            row.type =
                "button";

            row.className =
                isUnread
                    ? "news-row unread"
                    : "news-row";

            row.innerHTML = `
                <span class="news-author">
                    (${escapeHTML(
                        news.author
                    )})
                </span>

                <span class="news-title">
                    ${escapeHTML(
                        news.title
                    )}

                    ${
                        isUnread
                            ? `
                                <span class="news-unread">
                                    (안읽은 소식)
                                </span>
                              `
                            : ""
                    }
                </span>

            `;

            row.addEventListener(
                "click",
                function() {
                    openNewsDetail(
                        news.id
                    );
                }
            );

            list.appendChild(row);
        }
    );

    container.appendChild(list);
}

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
                "id, author, title, content, created_at, image_urls, view_count, category"
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

    currentCategory = news.category || "general";

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
            Number(news.view_count || 0) + 1;
    }

    currentNewsId =
        news.id;

    hideAllScreens();

    detailScreen.classList.add(
        "visible"
    );

    activateCategoryMenu(currentCategory);

    /*
        사진을 기존 article 내부가 아니라
        별도 영역에 넣는다.
    */

    detailImages.innerHTML = "";

    const imageUrls =
        Array.isArray(
            news.image_urls
        )
            ? news.image_urls
            : [];

    let validImageCount = 0;

    imageUrls.forEach(
        function(path) {

            const url =
                getPublicImageUrl(
                    path
                );

            if (!url) {
                return;
            }

            const image =
                document.createElement(
                    "img"
                );

            image.className =
                "news-image";

            image.src =
                url;

            image.alt =
                "소식 첨부 사진";

            image.loading =
                "lazy";

            detailImages.appendChild(
                image
            );

            validImageCount++;
        }
    );

    if (
        validImageCount > 0
    ) {
        detailImages.classList.remove(
            "hidden"
        );
    } else {
        detailImages.classList.add(
            "hidden"
        );
    }

    document.getElementById(
        "news-detail-container"
    ).innerHTML = `
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
            조회수 ${Number(news.view_count || 0)}
        </div>
    `;

    if (isAdmin) {
        const editButton =
            document.createElement("button");

        editButton.id =
            "edit-news-button";
        editButton.className =
            "orange-small-button edit-news-button";
        editButton.type =
            "button";
        editButton.textContent =
            "소식 수정";


        editButton.addEventListener(
            "click",
            function() {
                openEditScreen(news);
            }
        );

        document
            .getElementById("news-detail-container")
            .appendChild(editButton);
    }

    updateAuthUI();

    if (commentInput) {
        commentInput.value = "";
    }

    updateCommentLength();

    await renderNewsInteractions(
        news.id
    );

    scrollTop();
}

async function loadLikeState(newsId) {
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
            .select("id", {
                count: "exact",
                head: true
            })
            .eq(
                "news_id",
                newsId
            );

    if (!countError) {
        result.count = count || 0;
    } else {
        console.error(
            "좋아요 개수 조회 오류:",
            countError
        );
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from("news_likes")
            .select("id")
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
        result.liked = !!data;
    } else {
        console.error(
            "내 좋아요 조회 오류:",
            error
        );
    }

    return result;
}

function updateLikeButton(likeState) {
    if (!likeButton) {
        return;
    }

    const count =
        likeState?.count || 0;

    likeButton.classList.toggle(
        "liked",
        !!likeState?.liked
    );

    likeButton.innerHTML = `
        ${likeState?.liked ? "♥" : "♡"}
        좋아요
        <span class="like-count-number">
            ${count}
        </span>
    `;
}

async function toggleLike() {
    if (!currentUser) {
        alert(
            "좋아요를 누르려면 로그인해주세요."
        );
        openAuthScreen("login");
        return;
    }

    if (!currentNewsId) {
        return;
    }

    likeButton.disabled = true;

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
                    .from("news_likes")
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
                    .from("news_likes")
                    .insert({
                        news_id:
                            currentNewsId,
                        user_id:
                            currentUser.id
                    });

            if (
                error &&
                error.code !== "23505"
            ) {
                throw error;
            }
        }

        const newState =
            await loadLikeState(
                currentNewsId
            );

        updateLikeButton(
            newState
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
        likeButton.disabled = false;
    }
}

function updateCommentLength() {
    if (!commentInput || !commentLength) {
        return;
    }

    commentLength.textContent =
        `${commentInput.value.length} / 500`;
}

async function loadComments(newsId) {
    if (!commentsContainer || !commentCount) {
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
            .from("news_comments")
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
                    ascending: true
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

    commentsContainer.innerHTML = "";

    if (list.length === 0) {
        commentsContainer.innerHTML = `
            <div class="comments-empty">
                아직 댓글이 없습니다.
            </div>
        `;

        return;
    }

    const userIds = [
        ...new Set(
            list.map(
                comment =>
                    comment.user_id
            )
        )
    ];

    let profileMap =
        new Map();

    if (userIds.length > 0) {
        const {
            data: profiles,
            error: profileError
        } = await supabaseClient
            .rpc(
                "get_comment_profiles",
                {
                    p_user_ids: userIds
                }
            );

        if (!profileError) {
            profileMap =
                new Map(
                    (profiles || []).map(
                        profile => [
                            String(profile.id),
                            profile.username
                        ]
                    )
                );
        } else {
            console.error(
                "댓글 작성자 조회 RPC 오류:",
                profileError
            );

            commentsContainer.innerHTML = `
                <div class="comments-error">
                    댓글 닉네임 정보를 불러오지 못했습니다.<br>
                    Supabase의 get_comment_profiles SQL을 실행해주세요.
                </div>
            `;
            commentCount.textContent = `댓글 ${list.length}개`;
            return;
        }
    }

    if (currentUser && currentProfile?.username) {
        profileMap.set(
            String(currentUser.id),
            currentProfile.username
        );
    }

    list.forEach(
        function(comment) {
            const item =
                document.createElement(
                    "article"
                );

            item.className =
                "comment-item";

            const username =
                profileMap.get(
                    String(
                        comment.user_id
                    )
                ) || "회원";

            const canDelete =
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
                            username
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
                    canDelete
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
            function(button) {
                button.addEventListener(
                    "click",
                    function() {
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
        openAuthScreen("login");
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

    commentSubmit.disabled = true;
    commentSubmit.textContent =
        "등록 중...";

    try {
        const {
            error
        } =
            await supabaseClient
                .from("news_comments")
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

        commentInput.value = "";
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
        commentSubmit.disabled = false;
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
            .from("news_comments")
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
        likeButton.disabled = false;
        likeButton.classList.remove(
            "liked"
        );
        likeButton.innerHTML = `
            ♡ 좋아요
            <span class="like-count-number">0</span>
        `;

        commentLoginNotice.classList.remove(
            "hidden"
        );

        commentForm.classList.add(
            "hidden"
        );

        await loadComments(
            newsId
        );

        return;
    }

    commentLoginNotice.classList.add(
        "hidden"
    );

    commentForm.classList.remove(
        "hidden"
    );

    const likeState =
        await loadLikeState(
            newsId
        );

    updateLikeButton(
        likeState
    );

    await loadComments(
        newsId
    );
}

function formatDateTime(value) {
    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return (
        `${date.getFullYear()}.` +
        `${String(
            date.getMonth() + 1
        ).padStart(2, "0")}.` +
        `${String(
            date.getDate()
        ).padStart(2, "0")} ` +
        `${String(
            date.getHours()
        ).padStart(2, "0")}:` +
        `${String(
            date.getMinutes()
        ).padStart(2, "0")}`
    );
}

function resetWriteForm() {
    editingNewsId = null;
    const titleInput =
        document.getElementById(
            "input-title"
        );

    const contentInput =
        document.getElementById(
            "input-content"
        );

    if (titleInput) {
        titleInput.value = "";
    }

    if (contentInput) {
        contentInput.value = "";
    }

    if (imageInput) {
        imageInput.value = "";
    }

    selectedImageFiles = [];

    renderImagePreview();

    const heading =
        writeScreen.querySelector(
            ".write-box h1"
        );

    if (heading) {
        heading.textContent =
            `${categoryName(currentCategory)} 작성`;
    }

    const saveButton =
        document.getElementById(
            "save-write"
        );

    if (saveButton) {
        saveButton.textContent =
            `${categoryName(currentCategory)} 등록`;
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
            valid: false,
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
                valid: false,
                message:
                    `"${file.name}"은(는) 이미지 파일이 아닙니다.`
            };
        }

        if (
            file.size >
            MAX_IMAGE_SIZE
        ) {
            return {
                valid: false,
                message:
                    `"${file.name}"의 크기가 5MB를 초과합니다.`
            };
        }
    }

    return {
        valid: true,
        message: ""
    };
}

function handleImageSelection(
    event
) {
    const files =
        Array.from(
            event.target.files || []
        );

    const validation =
        validateSelectedImages(
            files
        );

    if (!validation.valid) {
        alert(
            validation.message
        );

        event.target.value = "";

        selectedImageFiles = [];

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

    imagePreview.innerHTML = "";

    selectedImageFiles.forEach(
        function(file) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "preview-item";

            const img =
                document.createElement(
                    "img"
                );

            img.alt =
                "선택한 사진 미리보기";

            const name =
                document.createElement(
                    "div"
                );

            name.className =
                "preview-name";

            name.textContent =
                file.name;

            item.appendChild(
                img
            );

            item.appendChild(
                name
            );

            imagePreview.appendChild(
                item
            );

            const reader =
                new FileReader();

            reader.onload =
                function(event) {
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
            selectedImageFiles.length > 0
                ? `${selectedImageFiles.length}장 선택됨 · 최대 ${MAX_IMAGES}장`
                : `사진을 선택하면 아래에 미리보기가 표시됩니다. 최대 ${MAX_IMAGES}장 · 사진 1장당 최대 5MB`;
    }
}

function createSafeFileName(
    originalName
) {
    const extension =
        originalName.includes(".")
            ? originalName
                .split(".")
                .pop()
                .toLowerCase()
            : "jpg";

    const random =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random()
                  .toString(36)
                  .slice(2)}`;

    return `${random}.${extension}`;
}

async function deleteUploadedImages(
    paths
) {
    if (
        !paths ||
        paths.length === 0
    ) {
        return;
    }

    const {
        error
    } =
        await supabaseClient.storage
            .from(
                NEWS_IMAGE_BUCKET
            )
            .remove(
                paths
            );

    if (error) {
        console.error(
            "업로드 이미지 정리 오류:",
            error
        );
    }
}

function openEditScreen(
    news
) {
    if (!isAdmin) {
        return;
    }

    editingNewsId =
        news.id;

    currentCategory = news.category || "general";

    document.getElementById(
        "input-title"
    ).value =
        news.title || "";

    document.getElementById(
        "input-content"
    ).value =
        news.content || "";

    if (imageInput) {
        imageInput.value = "";
    }

    selectedImageFiles = [];
    renderImagePreview();

    hideAllScreens();

    writeScreen.classList.add(
        "visible"
    );

    activateCategoryMenu(currentCategory);

    const heading =
        writeScreen.querySelector(
            ".write-box h1"
        );

    if (heading) {
        heading.textContent =
            `${categoryName(currentCategory)} 수정`;
    }

    const saveButton =
        document.getElementById(
            "save-write"
        );

    if (saveButton) {
        saveButton.textContent =
            "수정 저장";
    }

    scrollTop();
}

function closeEditMode() {
    editingNewsId = null;

    const heading =
        writeScreen.querySelector(
            ".write-box h1"
        );

    if (heading) {
        heading.textContent =
            "소식 작성";
    }

    const saveButton =
        document.getElementById(
            "save-write"
        );

    if (saveButton) {
        saveButton.textContent =
            `${categoryName(currentCategory)} 등록`;
    }
}

async function saveNews() {
    if (!currentUser) {
        alert(
            "로그인이 필요합니다."
        );

        openAuthScreen("login");

        return;
    }

    if (!isAdmin) {
        alert(
            "관리자만 소식을 작성할 수 있습니다."
        );

        return;
    }

    const title =
        document
            .getElementById(
                "input-title"
            )
            .value
            .trim();

    const content =
        document
            .getElementById(
                "input-content"
            )
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

    const files =
        imageInput
            ? Array.from(
                imageInput.files || []
            )
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

    const saveButton =
        document.getElementById(
            "save-write"
        );

    if (editingNewsId !== null) {
        saveButton.disabled = true;
        saveButton.textContent =
            "수정 중...";

        try {
            const {
                error
            } =
                await supabaseClient
                    .from("news")
                    .update({
                        title: title,
                        content: content
                    })
                    .eq(
                        "id",
                        editingNewsId
                    );

            if (error) {
                throw error;
            }

            const editedId =
                editingNewsId;

            editingNewsId = null;
            resetWriteForm();

            await openNewsDetail(
                editedId,
                false
            );

        } catch (error) {
            console.error(
                "소식 수정 오류:",
                error
            );

            alert(
                "소식 수정 오류:\n" +
                error.message
            );

        } finally {
            saveButton.disabled =
                false;
            saveButton.textContent =
                "수정 저장";
        }

        return;
    }

    saveButton.disabled = true;
    saveButton.textContent =
        "등록 중...";

    let uploadedPaths = [];

    try {

        const {
            data: userData,
            error: userError
        } =
            await supabaseClient.auth
                .getUser();

        if (
            userError ||
            !userData ||
            !userData.user
        ) {
            alert(
                "로그인이 필요합니다."
            );

            return;
        }

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
                    userData.user.id
                )
                .maybeSingle();

        if (profileError) {
            alert(
                "회원 정보 오류:\n" +
                profileError.message
            );

            return;
        }

        if (
            !profile ||
            profile.can_manage_news !== true
        ) {
            alert(
                "관리자 권한이 없습니다."
            );

            return;
        }

        for (
            let i = 0;
            i < files.length;
            i++
        ) {
            const file =
                files[i];

            const fileName =
                createSafeFileName(
                    file.name
                );

            const filePath =
                `${currentUser.id}/${fileName}`;

            const {
                error: uploadError
            } =
                await supabaseClient.storage
                    .from(
                        NEWS_IMAGE_BUCKET
                    )
                    .upload(
                        filePath,
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

                await deleteUploadedImages(
                    uploadedPaths
                );

                alert(
                    "사진 업로드 오류:\n" +
                    uploadError.message
                );

                return;
            }

            uploadedPaths.push(
                filePath
            );

            saveButton.textContent =
                `사진 업로드 중... ${i + 1}/${files.length}`;
        }

        saveButton.textContent =
            "소식 등록 중...";

        const {
            error: insertError
        } =
            await supabaseClient
                .from("news")
                .insert({
                    author:
                        profile.username,

                    title:
                        title,

                    content:
                        content,

                    image_urls:
                        uploadedPaths,

                    category:
                        currentCategory
                });

        if (insertError) {

            await deleteUploadedImages(
                uploadedPaths
            );

            alert(
                "소식 등록 오류:\n" +
                insertError.message
            );

            return;
        }

        const savedCategory = currentCategory;
        resetWriteForm();
        currentCategory = savedCategory;

        await openCategoryList(savedCategory);

    } catch (error) {

        console.error(
            "소식 등록 예외:",
            error
        );

        await deleteUploadedImages(
            uploadedPaths
        );

        alert(
            "소식 등록 중 오류가 발생했습니다:\n" +
            error.message
        );

    } finally {
        saveButton.disabled = false;
        saveButton.textContent =
            "소식 등록";
    }
}

async function deleteCurrentNews() {
    if (!currentUser) {
        return;
    }

    if (!isAdmin) {
        alert(
            "관리자만 삭제할 수 있습니다."
        );

        return;
    }

    if (!currentNewsId) {
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
                "id, image_urls"
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
        error: deleteError
    } =
        await supabaseClient
            .from("news")
            .delete()
            .eq(
                "id",
                currentNewsId
            );

    if (deleteError) {
        alert(
            "소식 삭제 오류:\n" +
            deleteError.message
        );

        return;
    }

    const imagePaths =
        Array.isArray(
            news?.image_urls
        )
            ? news.image_urls
            : [];

    if (
        imagePaths.length > 0
    ) {
        await deleteUploadedImages(
            imagePaths
        );
    }

    const deletedCategory = currentCategory;
    currentNewsId = null;

    await openCategoryList(deletedCategory);
}

function escapeHTML(value) {
    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

function escapeAttribute(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document
    .getElementById(
        "show-news-list"
    )
    .addEventListener(
        "click",
        function() {
            if (currentCategory === "community") {
                openAdminCommunityChat();
                return;
            }

            openCategoryList(currentCategory);
        }
    );

document
    .getElementById(
        "show-write"
    )
    .addEventListener(
        "click",
        openWriteScreen
    );

document
    .getElementById(
        "back-to-list"
    )
    .addEventListener(
        "click",
        function() {
            openCategoryList(currentCategory);
        }
    );

document
    .getElementById(
        "back-from-write"
    )
    .addEventListener(
        "click",
        function() {
            openCategoryList(currentCategory);
        }
    );

document
    .getElementById(
        "cancel-write"
    )
    .addEventListener(
        "click",
        function() {
            openCategoryList(currentCategory);
        }
    );

document
    .getElementById(
        "save-write"
    )
    .addEventListener(
        "click",
        saveNews
    );

document
    .getElementById(
        "delete-news"
    )
    .addEventListener(
        "click",
        deleteCurrentNews
    );

if (homeMenu) {
    homeMenu.addEventListener(
        "click",
        openHome
    );
}

const homeNewsButton =
    document.getElementById("home-news-button");

const homeRecentMore =
    document.getElementById("home-recent-more");

const homeQuickNews =
    document.getElementById("home-quick-news");

const homeQuickSports =
    document.getElementById("home-quick-sports");

const homeQuickCommunity =
    document.getElementById("home-quick-community");

const homeQuickDonation =
    document.getElementById("home-quick-donation");

if (homeNewsButton) {
    homeNewsButton.addEventListener(
        "click",
        openNewsIntro
    );
}

if (homeRecentMore) {
    homeRecentMore.addEventListener(
        "click",
        openNewsIntro
    );
}

if (homeQuickNews) {
    homeQuickNews.addEventListener(
        "click",
        openNewsIntro
    );
}

if (homeQuickSports) {
    homeQuickSports.addEventListener(
        "click",
        openSportsNews
    );
}

if (homeQuickCommunity) {
    homeQuickCommunity.addEventListener(
        "click",
        openAdminCommunity
    );
}

if (homeQuickDonation) {
    homeQuickDonation.addEventListener(
        "click",
        openDonation
    );
}

document
    .getElementById(
        "menu-news"
    )
    .addEventListener(
        "click",
        openNewsIntro
    );

document
    .getElementById(
        "menu-donation"
    )
    .addEventListener(
        "click",
        openDonation
    );

if (sportsNewsMenu) {
    sportsNewsMenu.addEventListener(
        "click",
        openSportsNews
    );
}

if (adminCommunityMenu) {
    adminCommunityMenu.addEventListener(
        "click",
        openAdminCommunity
    );
}

if (advancedNewsMenu) {
    advancedNewsMenu.addEventListener(
        "click",
        openAdvancedNews
    );
}

videoPreviewMenu.addEventListener(
    "click",
    openVideoPreview
);

accountButton.addEventListener(
    "click",
    handleAccountButton
);


loginTab.addEventListener(
    "click",
    function() {
        showAuthMode("login");
    }
);

signupTab.addEventListener(
    "click",
    function() {
        showAuthMode("signup");
    }
);

document
    .getElementById(
        "login-submit"
    )
    .addEventListener(
        "click",
        login
    );

document
    .getElementById(
        "signup-submit"
    )
    .addEventListener(
        "click",
        signup
    );

document
    .getElementById(
        "auth-cancel"
    )
    .addEventListener(
        "click",
        openNewsIntro
    );

document
    .getElementById(
        "login-password"
    )
    .addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {
                login();
            }

        }
    );

document
    .getElementById(
        "signup-password-confirm"
    )
    .addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {
                signup();
            }

        }
    );

if (imageInput) {

    imageInput.addEventListener(
        "change",
        handleImageSelection
    );

}

if (likeButton) {
    likeButton.addEventListener(
        "click",
        toggleLike
    );
}

if (commentInput) {
    commentInput.addEventListener(
        "input",
        updateCommentLength
    );

    commentInput.addEventListener(
        "keydown",
        function(event) {
            if (
                event.key === "Enter" &&
                (event.ctrlKey || event.metaKey)
            ) {
                event.preventDefault();
                submitComment();
            }
        }
    );
}

if (commentSubmit) {
    commentSubmit.addEventListener(
        "click",
        submitComment
    );
}

if (communityMessageInput) {
    communityMessageInput.addEventListener(
        "input",
        updateCommunityMessageLength
    );

    communityMessageInput.addEventListener(
        "keydown",
        function(event) {
            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();
                sendCommunityMessage();
            }
        }
    );
}

if (communitySendButton) {
    communitySendButton.addEventListener(
        "click",
        sendCommunityMessage
    );
}

if (videoFileInput) {
    videoFileInput.addEventListener(
        "change",
        function() {
            const file = videoFileInput.files?.[0] || null;

            if (!file) {
                videoFileName.textContent = "선택된 영상 없음";
                return;
            }

            if (file.size > MAX_VIDEO_SIZE) {
                videoFileName.textContent =
                    `${file.name} · ${formatFileSize(file.size)} · 5GB 초과`;
                setVideoUploadStatus(
                    "5GB보다 큰 영상은 선택할 수 없습니다.",
                    "error"
                );
                return;
            }

            videoFileName.textContent =
                `${file.name} · ${formatFileSize(file.size)}`;
            setVideoUploadStatus("");
        }
    );
}

if (videoUploadButton) {
    videoUploadButton.addEventListener(
        "click",
        uploadVideo
    );
}

if (menuToggle) {
    menuToggle.addEventListener("click", toggleSidebarDrawer);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebarDrawer);
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeSidebarDrawer();
    }
});

if (sidebar) {
    sidebar.querySelectorAll(".menu-item").forEach(function(menu) {
        menu.addEventListener("click", function() {
            if (!menu.disabled) {
                closeSidebarDrawer();
            }
        });
    });
}

supabaseClient.auth.onAuthStateChange(
    function(
        event,
        session
    ) {

        if (
            event ===
            "SIGNED_OUT"
        ) {
            currentUser = null;
            currentProfile = null;
            isAdmin = false;

            updateAuthUI();

            /*
             * Supabase auth callback 안에서 다른 Supabase 요청을
             * await하지 않습니다. 이렇게 해야 로그인 직후
             * auth lock으로 인해 요청이 멈추는 문제를 피할 수 있습니다.
             */
            setTimeout(async function() {
                if (currentNewsId !== null) {
                    await renderNewsInteractions(
                        currentNewsId
                    );
                }

                if (
                    adminCommunityScreen &&
                    adminCommunityScreen.classList.contains("visible")
                ) {
                    communityInitialLoad = true;
                    await loadCommunityMessages();
                }
            }, 0);

            return;
        }

        if (
            session &&
            session.user
        ) {
            currentUser =
                session.user;

            updateAuthUI();

            /*
             * 프로필 조회는 auth callback 바깥의 다음 task에서 처리합니다.
             */
            setTimeout(async function() {
                await loadCurrentProfile();

                if (currentNewsId !== null) {
                    await renderNewsInteractions(
                        currentNewsId
                    );
                }

                if (
                    adminCommunityScreen &&
                    adminCommunityScreen.classList.contains("visible")
                ) {
                    communityInitialLoad = true;
                    await loadCommunityMessages();
                }
            }, 0);
        }

    }
);

async function initialize() {

    /* 홈은 Supabase 응답을 기다리지 않고 즉시 표시 */
    const hash = window.location.hash.toLowerCase();

    if (!hash) {
        openHome();
    }

    await refreshAuthState();

    updateAuthUI();

    renderImagePreview();

    if (hash === "#news") {
        openNewsIntro();
    } else if (hash === "#sports") {
        openSportsNews();
    } else if (hash === "#community") {
        openAdminCommunity();
    } else if (hash === "#donation") {
        openDonation();
    } else if (hash === "#advanced") {
        openAdvancedNews();
    } else if (hash === "#video") {
        openVideoPreview();
    }

}

initialize();
