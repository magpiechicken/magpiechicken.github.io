"use strict";

const SUPABASE_URL =
    "https://kxrjevmxayolcqcgmixz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_KrmPM2G4nuS1JXOAvnp-cA_Ik1nuYqS";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

let currentUser = null;
let currentProfile = null;
let isAdmin = false;
let currentNewsId = null;

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
        }

    } else {
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
    } = await supabaseClient
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
    } = await supabaseClient.auth.getUser();

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

function openAuthScreen(mode = "login") {
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

        await loadCurrentProfile();

        if (!currentProfile) {
            await supabaseClient.auth
                .signOut();

            currentUser = null;
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
                await supabaseClient.auth
                    .signOut();

                currentUser = null;
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
    } = await supabaseClient.auth.signOut();

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
    } = await supabaseClient
        .from("news")
        .select(
            "id, author, title, content, created_at"
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

async function getReadNewsIds(newsList) {
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
                return String(news.id);
            }
        );

    const {
        data,
        error
    } = await supabaseClient
        .from("news_reads")
        .select("news_id")
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

async function markNewsAsRead(newsId) {
    if (!currentUser) {
        return;
    }

    const {
        error
    } = await supabaseClient
        .from("news_reads")
        .insert({
            user_id:
                currentUser.id,
            news_id:
                String(newsId),
            read_at:
                new Date().toISOString()
        }, {
            ignoreDuplicates: true
        });

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

    if (newsList.length === 0) {
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
                currentUser
                &&
                !readNewsIds.has(
                    newsKey
                );

            const row =
                document.createElement(
                    "button"
                );

            row.type = "button";

            row.className =
                isUnread
                    ? "news-row unread"
                    : "news-row";

            row.innerHTML = `
                <span class="news-author">
                    (${escapeHTML(news.author)})
                </span>

                <span class="news-title">
                    ${escapeHTML(news.title)}

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

async function openNewsDetail(newsId) {
    const {
        data: news,
        error
    } = await supabaseClient
        .from("news")
        .select(
            "id, author, title, content, created_at"
        )
        .eq(
            "id",
            newsId
        )
        .single();

    if (error) {
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

    document.getElementById(
        "news-detail-container"
    ).innerHTML = `
        <div class="detail-author">
            (${escapeHTML(news.author)})
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
        document.getElementById(
            "input-title"
        ).value.trim();

    const content =
        document.getElementById(
            "input-content"
        ).value.trim();

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

    const {
        data: userData,
        error: userError
    } = await supabaseClient.auth
        .getUser();

    if (
        userError ||
        !userData ||
        !userData.user
    ) {
        currentUser = null;
        currentProfile = null;
        isAdmin = false;

        updateAuthUI();

        alert(
            "로그인이 필요합니다."
        );

        return;
    }

    const {
        data: profile,
        error: profileError
    } = await supabaseClient
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

    const {
        error
    } = await supabaseClient
        .from("news")
        .insert({
            author:
                profile.username,
            title:
                title,
            content:
                content
        });

    if (error) {
        console.error(
            "소식 등록 오류:",
            error
        );

        alert(
            "소식 등록 오류:\n" +
            error.message
        );

        return;
    }

    document.getElementById(
        "input-title"
    ).value = "";

    document.getElementById(
        "input-content"
    ).value = "";

    await openNewsList();
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
        error
    } = await supabaseClient
        .from("news")
        .delete()
        .eq(
            "id",
            currentNewsId
        );

    if (error) {
        console.error(
            "소식 삭제 오류:",
            error
        );

        alert(
            "소식 삭제 오류:\n" +
            error.message
        );

        return;
    }

    currentNewsId =
        null;

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

document
    .getElementById(
        "accountButton"
    )
    .addEventListener(
        "click",
        handleAccountButton
    );

document
    .getElementById(
        "login-tab"
    )
    .addEventListener(
        "click",
        function() {
            showAuthMode("login");
        }
    );

document
    .getElementById(
        "signup-tab"
    )
    .addEventListener(
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
                event.key === "Enter"
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
                event.key === "Enter"
            ) {
                signup();
            }
        }
    );

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

    openNewsIntro();
}

initialize();
