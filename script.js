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

const newsMenu =
    document.getElementById("menu-news");

const donationMenu =
    document.getElementById("menu-donation");

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

function hideAllScreens() {
    introScreen.classList.remove("visible");
    listScreen.classList.remove("visible");
    detailScreen.classList.remove("visible");
    writeScreen.classList.remove("visible");
    authScreen.classList.remove("visible");
    donationScreen.classList.remove("visible");
}

function activateNewsMenu() {
    newsMenu.classList.add("active");
    donationMenu.classList.remove("active");
}

function activateDonationMenu() {
    donationMenu.classList.add("active");
    newsMenu.classList.remove("active");
}

function scrollTop() {
    const main =
        document.querySelector(".main-content");

    if (main) {
        main.scrollTop = 0;
    }
}

function updateAuthUI() {
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

function openLoginInfo() {
    const currentStatus =
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
                    ${isAdmin ? "관리자" : "일반 회원"}
                </div>
              `
            : `
                <div class="login-info-status">
                    현재 상태: 로그아웃 상태
                </div>
              `;

    loginInfoContent.innerHTML = `
        ${currentStatus}

        <div class="login-info-section">
            <h3>로그아웃 상태 · 장점</h3>
            <ul>
                <li>로그인하지 않아도 사이트를 볼 수 있습니다.</li>
                <li>계정과 비밀번호를 입력할 필요가 없습니다.</li>
                <li>빠르게 소식을 확인할 수 있습니다.</li>
                <li>공용 기기에서도 편하게 사용할 수 있습니다.</li>
            </ul>
        </div>

        <div class="login-info-section">
            <h3>로그아웃 상태 · 단점</h3>
            <ul>
                <li>개인별 안읽은 소식 표시를 사용할 수 없습니다.</li>
                <li>소식 작성 및 삭제 기능을 사용할 수 없습니다.</li>
                <li>계정별 기능을 사용할 수 없습니다.</li>
                <li>회원별 읽음 기록을 저장할 수 없습니다.</li>
            </ul>
        </div>

        <div class="login-info-section">
            <h3>로그인 상태 · 장점</h3>
            <ul>
                <li>개인별 안읽은 소식을 확인할 수 있습니다.</li>
                <li>소식을 읽으면 안읽은 표시가 사라집니다.</li>
                <li>내 계정으로 사이트를 이용할 수 있습니다.</li>
                <li>관리자라면 소식을 작성하고 삭제할 수 있습니다.</li>
            </ul>
        </div>

        <div class="login-info-section">
            <h3>로그인 상태 · 단점</h3>
            <ul>
                <li>로그인과 비밀번호가 필요합니다.</li>
                <li>다른 기기에서는 다시 로그인해야 할 수 있습니다.</li>
                <li>계정 정보를 안전하게 관리해야 합니다.</li>
            </ul>
        </div>
    `;

    loginInfoModal.classList.remove(
        "hidden"
    );
}

function closeLoginInfoModal() {
    loginInfoModal.classList.add(
        "hidden"
    );
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

        await loadCurrentProfile();

        if (!currentProfile) {
            await supabaseClient.auth.signOut();

            currentUser = null;
            currentProfile = null;
            isAdmin = false;

            updateAuthUI();

            authMessage.textContent =
                "로그인은 성공했지만 회원 정보를 찾지 못했습니다.";

            return;
        }

        await openNewsList();

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

            await openNewsList();

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

async function getNews() {
    const {
        data,
        error
    } =
        await supabaseClient
            .from("news")
            .select(
                "id, author, title, content, created_at, image_urls"
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

async function renderNews() {
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
        await getNews();

    if (
        newsList.length === 0
    ) {
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

                <span class="news-date">
                    ${formatDate(
                        news.created_at
                    )}
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
    newsId
) {
    const {
        data: news,
        error
    } =
        await supabaseClient
            .from("news")
            .select(
                "id, author, title, content, created_at, image_urls"
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

    currentNewsId =
        news.id;

    hideAllScreens();

    detailScreen.classList.add(
        "visible"
    );

    activateNewsMenu();

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
    `;

    updateAuthUI();

    scrollTop();
}

function resetWriteForm() {
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
                        uploadedPaths
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

        resetWriteForm();

        await openNewsList();

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

    currentNewsId = null;

    await openNewsList();
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

document
    .getElementById(
        "show-news-list"
    )
    .addEventListener(
        "click",
        openNewsList
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
        openNewsList
    );

document
    .getElementById(
        "back-from-write"
    )
    .addEventListener(
        "click",
        openNewsList
    );

document
    .getElementById(
        "cancel-write"
    )
    .addEventListener(
        "click",
        openNewsList
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

accountButton.addEventListener(
    "click",
    handleAccountButton
);

loginInfoButton.addEventListener(
    "click",
    openLoginInfo
);

closeLoginInfo.addEventListener(
    "click",
    closeLoginInfoModal
);

loginInfoModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target ===
            loginInfoModal
        ) {
            closeLoginInfoModal();
        }

    }
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

supabaseClient.auth.onAuthStateChange(
    async function(
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

            return;
        }

        if (
            session &&
            session.user
        ) {

            currentUser =
                session.user;

            await loadCurrentProfile();

        }

    }
);

async function initialize() {

    await refreshAuthState();

    updateAuthUI();

    renderImagePreview();

    openNewsIntro();

}

initialize();
