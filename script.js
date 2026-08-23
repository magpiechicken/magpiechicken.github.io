"use strict";

/* ==================================================
   Supabase 설정
================================================== */

const SUPABASE_URL =
    "https://kxrjevmxayolcqcgmixz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_KrmPM2G4nuS1JXOAvnp-cA_Ik1nuYqS";

const ADMIN_AUTH_EMAIL =
    "qwertjbhbuhbbjt@gmail.com";


/* ==================================================
   Supabase 연결
================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* ==================================================
   상태
================================================== */

let isAdmin = false;
let currentNewsId = null;


/* ==================================================
   화면 요소
================================================== */

const introScreen =
    document.getElementById("screen-news-intro");

const listScreen =
    document.getElementById("screen-news-list");

const detailScreen =
    document.getElementById("screen-news-detail");

const writeScreen =
    document.getElementById("screen-write");

const loginScreen =
    document.getElementById("screen-admin-login");

const donationScreen =
    document.getElementById("screen-donation");


const newsMenu =
    document.getElementById("menu-news");

const donationMenu =
    document.getElementById("menu-donation");


const adminButton =
    document.getElementById("adminButton");

const showWriteButton =
    document.getElementById("show-write");

const deleteNewsButton =
    document.getElementById("delete-news");


/* ==================================================
   화면 숨기기
================================================== */

function hideAllScreens() {
    introScreen.classList.remove("visible");
    listScreen.classList.remove("visible");
    detailScreen.classList.remove("visible");
    writeScreen.classList.remove("visible");
    loginScreen.classList.remove("visible");
    donationScreen.classList.remove("visible");
}


/* ==================================================
   메뉴 상태
================================================== */

function activateNewsMenu() {
    newsMenu.classList.add("active");
    donationMenu.classList.remove("active");
}

function activateDonationMenu() {
    donationMenu.classList.add("active");
    newsMenu.classList.remove("active");
}


/* ==================================================
   관리자 UI
================================================== */

function updateAdminUI() {

    if (isAdmin) {

        adminButton.textContent = "관리자 로그아웃";
        adminButton.classList.add("logged-in");

        showWriteButton.classList.remove("hidden");

        if (currentNewsId !== null) {
            deleteNewsButton.classList.remove("hidden");
        }

    } else {

        adminButton.textContent = "관리자";
        adminButton.classList.remove("logged-in");

        showWriteButton.classList.add("hidden");
        deleteNewsButton.classList.add("hidden");
    }
}


/* ==================================================
   소식 소개
================================================== */

function openNewsIntro() {

    hideAllScreens();

    introScreen.classList.add("visible");

    activateNewsMenu();

    currentNewsId = null;

    updateAdminUI();

    scrollTop();
}


/* ==================================================
   소식 목록
================================================== */

async function openNewsList() {

    hideAllScreens();

    listScreen.classList.add("visible");

    activateNewsMenu();

    currentNewsId = null;

    updateAdminUI();

    scrollTop();

    await renderNews();
}


/* ==================================================
   관리자 로그인 화면
================================================== */

function openAdminLogin() {

    if (isAdmin) {
        logoutAdmin();
        return;
    }

    hideAllScreens();

    loginScreen.classList.add("visible");

    activateNewsMenu();

    document.getElementById("admin-username").value = "";
    document.getElementById("admin-password").value = "";

    document.getElementById("login-error").textContent = "";

    scrollTop();
}


/* ==================================================
   관리자 로그인
   여기서 실제 Supabase 에러를 그대로 표시
================================================== */

async function loginAdmin() {

    const usernameInput =
        document.getElementById("admin-username");

    const passwordInput =
        document.getElementById("admin-password");

    const errorBox =
        document.getElementById("login-error");

    const loginButton =
        document.getElementById("admin-login-submit");


    const email =
        usernameInput.value.trim();

    const password =
        passwordInput.value;


    errorBox.textContent = "";


    if (!email) {
        errorBox.textContent = "이메일을 입력해주세요.";
        return;
    }


    if (!password) {
        errorBox.textContent = "비밀번호를 입력해주세요.";
        return;
    }


    loginButton.disabled = true;
    loginButton.textContent = "로그인 중...";


    try {

        console.log("로그인 시도:", email);


        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


        /* ------------------------------------------
           Supabase Auth 실패
        ------------------------------------------ */

        if (error) {

            console.error("Supabase Auth 오류:", error);

            errorBox.textContent =
                "Supabase 오류: "
                + error.message;

            return;
        }


        console.log("Auth 로그인 성공:", data);


        /* ------------------------------------------
           로그인 사용자 확인
        ------------------------------------------ */

        const {
            data: userData,
            error: userError
        } = await supabaseClient.auth.getUser();


        if (userError) {

            console.error(
                "사용자 정보 오류:",
                userError
            );

            errorBox.textContent =
                "사용자 확인 오류: "
                + userError.message;

            return;
        }


        if (
            !userData
            || !userData.user
        ) {

            errorBox.textContent =
                "로그인은 되었지만 사용자 정보가 없습니다.";

            return;
        }


        console.log(
            "로그인 사용자 UID:",
            userData.user.id
        );


        /* ------------------------------------------
           profiles 확인
        ------------------------------------------ */

        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select(
                "id, username, can_manage_news"
            )
            .eq(
                "id",
                userData.user.id
            )
            .maybeSingle();


        if (profileError) {

            console.error(
                "Profiles 오류:",
                profileError
            );

            await supabaseClient.auth.signOut();

            errorBox.textContent =
                "Profiles 오류: "
                + profileError.message;

            return;
        }


        console.log(
            "Profile 결과:",
            profile
        );


        if (!profile) {

            await supabaseClient.auth.signOut();

            errorBox.textContent =
                "로그인은 성공했지만 profiles에 해당 사용자가 없습니다.";

            return;
        }


        if (!profile.can_manage_news) {

            await supabaseClient.auth.signOut();

            errorBox.textContent =
                "로그인은 성공했지만 관리자 권한이 없습니다. "
                + "can_manage_news 값을 true로 설정해주세요.";

            return;
        }


        /* ------------------------------------------
           최종 성공
        ------------------------------------------ */

        isAdmin = true;

        updateAdminUI();

        await openNewsList();


    } catch (error) {

        console.error(
            "예외 발생:",
            error
        );

        errorBox.textContent =
            "JavaScript 오류: "
            + error.message;

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "관리자 로그인";

    }
}


/* ==================================================
   로그아웃
================================================== */

async function logoutAdmin() {

    const {
        error
    } = await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "로그아웃 오류:",
            error
        );

    }


    isAdmin = false;
    currentNewsId = null;

    updateAdminUI();

    openNewsIntro();
}


/* ==================================================
   기존 세션 확인
================================================== */

async function checkAdminSession() {

    try {

        const {
            data
        } = await supabaseClient.auth.getSession();


        if (
            !data
            || !data.session
        ) {

            isAdmin = false;
            updateAdminUI();

            return;
        }


        const {
            data: userData,
            error: userError
        } = await supabaseClient.auth.getUser();


        if (
            userError
            || !userData
            || !userData.user
        ) {

            isAdmin = false;
            updateAdminUI();

            return;
        }


        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select(
                "id, username, can_manage_news"
            )
            .eq(
                "id",
                userData.user.id
            )
            .maybeSingle();


        if (
            profileError
            || !profile
            || !profile.can_manage_news
        ) {

            await supabaseClient.auth.signOut();

            isAdmin = false;
            updateAdminUI();

            return;
        }


        isAdmin = true;

        updateAdminUI();

    } catch (error) {

        console.error(
            "세션 확인 오류:",
            error
        );

        isAdmin = false;

        updateAdminUI();
    }
}


/* ==================================================
   작성 화면
================================================== */

function openWriteScreen() {

    if (!isAdmin) {

        openAdminLogin();

        return;
    }


    hideAllScreens();

    writeScreen.classList.add("visible");

    activateNewsMenu();

    scrollTop();
}


/* ==================================================
   기부
================================================== */

function openDonation() {

    hideAllScreens();

    donationScreen.classList.add("visible");

    activateDonationMenu();

    scrollTop();
}


/* ==================================================
   소식 가져오기
================================================== */

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
            "소식 불러오기 오류: "
            + error.message
        );

        return [];
    }


    return data || [];
}


/* ==================================================
   날짜
================================================== */

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
        date.getFullYear()
        + "."
        + String(
            date.getMonth() + 1
        ).padStart(2, "0")
        + "."
        + String(
            date.getDate()
        ).padStart(2, "0")
    );
}


/* ==================================================
   소식 목록
================================================== */

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


    container.innerHTML = "";


    const list =
        document.createElement("div");

    list.className = "news-list";


    newsList.forEach(function(news) {

        const row =
            document.createElement("button");

        row.type = "button";

        row.className = "news-row";


        row.innerHTML = `
            <span class="news-author">
                (${escapeHTML(news.author)})
            </span>

            <span class="news-title">
                ${escapeHTML(news.title)}
            </span>

            <span class="news-date">
                ${formatDate(news.created_at)}
            </span>
        `;


        row.addEventListener(
            "click",
            function() {
                openNewsDetail(news.id);
            }
        );


        list.appendChild(row);

    });


    container.appendChild(list);
}


/* ==================================================
   소식 상세
================================================== */

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
            "상세 소식 오류: "
            + error.message
        );

        return;
    }


    currentNewsId =
        news.id;


    hideAllScreens();

    detailScreen.classList.add("visible");

    activateNewsMenu();


    document.getElementById(
        "news-detail-container"
    ).innerHTML = `
        <div class="detail-author">
            (${escapeHTML(news.author)})
        </div>

        <div class="detail-title-line">

            <h1 class="detail-title">
                ${escapeHTML(news.title)}
            </h1>

            <span class="detail-date">
                ${formatDate(news.created_at)}
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


    updateAdminUI();

    scrollTop();
}


/* ==================================================
   소식 등록
================================================== */

async function saveNews() {

    if (!isAdmin) {

        alert(
            "관리자만 소식을 작성할 수 있습니다."
        );

        return;
    }


    const title =
        document
            .getElementById("input-title")
            .value
            .trim();


    const content =
        document
            .getElementById("input-content")
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


    const {
        data: userData,
        error: userError
    } = await supabaseClient.auth.getUser();


    if (
        userError
        || !userData
        || !userData.user
    ) {

        alert(
            "관리자 로그인 세션이 없습니다."
        );

        isAdmin = false;

        updateAdminUI();

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
            "Profiles 오류: "
            + profileError.message
        );

        return;
    }


    if (
        !profile
        || !profile.can_manage_news
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

        alert(
            "소식 등록 오류: "
            + error.message
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


/* ==================================================
   소식 삭제
================================================== */

async function deleteCurrentNews() {

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

        alert(
            "소식 삭제 오류: "
            + error.message
        );

        return;
    }


    currentNewsId = null;

    await openNewsList();
}


/* ==================================================
   HTML 안전 처리
================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==================================================
   스크롤
================================================== */

function scrollTop() {

    const main =
        document.querySelector(
            ".main-content"
        );


    if (main) {

        main.scrollTop = 0;
    }
}


/* ==================================================
   버튼 연결
================================================== */

document
    .getElementById("show-news-list")
    .addEventListener(
        "click",
        openNewsList
    );


document
    .getElementById("show-write")
    .addEventListener(
        "click",
        openWriteScreen
    );


document
    .getElementById("back-to-list")
    .addEventListener(
        "click",
        openNewsList
    );


document
    .getElementById("back-from-write")
    .addEventListener(
        "click",
        openNewsList
    );


document
    .getElementById("cancel-write")
    .addEventListener(
        "click",
        openNewsList
    );


document
    .getElementById("save-write")
    .addEventListener(
        "click",
        saveNews
    );


document
    .getElementById("delete-news")
    .addEventListener(
        "click",
        deleteCurrentNews
    );


document
    .getElementById("menu-news")
    .addEventListener(
        "click",
        openNewsIntro
    );


document
    .getElementById("menu-donation")
    .addEventListener(
        "click",
        openDonation
    );


document
    .getElementById("adminButton")
    .addEventListener(
        "click",
        openAdminLogin
    );


document
    .getElementById("admin-login-submit")
    .addEventListener(
        "click",
        loginAdmin
    );


document
    .getElementById("cancel-login")
    .addEventListener(
        "click",
        openNewsIntro
    );


document
    .getElementById("admin-password")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {
                loginAdmin();
            }

        }
    );


/* ==================================================
   시작
================================================== */

updateAdminUI();

checkAdminSession();

openNewsIntro();
