"use strict";

/* ==================================================
   Supabase 설정
================================================== */

const SUPABASE_URL =
    "https://kxrjevmxayolcqcgmixz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_KrmPM2G4nuS1JXOAvnp-cA_Ik1nuYqS";


/*
 * 지금은 테스트 단계라 실제 Auth 이메일을 사용한다.
 * 나중에 로그인 UI를 username으로 바꿀 수 있다.
 */
const ADMIN_AUTH_EMAIL =
    "qwertjbhbuhbbjt@gmail.com";


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


/* ==================================================
   메뉴 요소
================================================== */

const newsMenu =
    document.getElementById("menu-news");

const donationMenu =
    document.getElementById("menu-donation");


/* ==================================================
   관리자 UI
================================================== */

const adminButton =
    document.getElementById("adminButton");

const showWriteButton =
    document.getElementById("show-write");

const deleteNewsButton =
    document.getElementById("delete-news");


/* ==================================================
   모든 화면 숨기기
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
   소식 메뉴 활성화
================================================== */

function activateNewsMenu() {

    newsMenu.classList.add("active");
    donationMenu.classList.remove("active");

}


/* ==================================================
   기부 메뉴 활성화
================================================== */

function activateDonationMenu() {

    donationMenu.classList.add("active");
    newsMenu.classList.remove("active");

}


/* ==================================================
   관리자 UI 업데이트
================================================== */

function updateAdminUI() {

    if (isAdmin) {

        adminButton.textContent =
            "관리자 로그아웃";

        adminButton.classList.add(
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

        adminButton.textContent =
            "관리자";

        adminButton.classList.remove(
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


/* ==================================================
   소식 소개 화면
================================================== */

function openNewsIntro() {

    hideAllScreens();

    introScreen.classList.add(
        "visible"
    );

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

    listScreen.classList.add(
        "visible"
    );

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

    loginScreen.classList.add(
        "visible"
    );

    activateNewsMenu();


    const usernameInput =
        document.getElementById(
            "admin-username"
        );

    const passwordInput =
        document.getElementById(
            "admin-password"
        );

    const errorBox =
        document.getElementById(
            "login-error"
        );


    usernameInput.value = "";
    passwordInput.value = "";
    errorBox.textContent = "";


    scrollTop();

}


/* ==================================================
   관리자 로그인
================================================== */

async function loginAdmin() {

    const usernameInput =
        document.getElementById(
            "admin-username"
        );

    const passwordInput =
        document.getElementById(
            "admin-password"
        );

    const errorBox =
        document.getElementById(
            "login-error"
        );

    const loginButton =
        document.getElementById(
            "admin-login-submit"
        );


    /*
     * 현재는 Supabase Auth 테스트를 위해
     * 아이디 칸에도 이메일을 입력하도록 한다.
     */
    const email =
        usernameInput.value.trim();

    const password =
        passwordInput.value;


    errorBox.textContent = "";


    if (!email) {

        errorBox.textContent =
            "이메일을 입력해주세요.";

        usernameInput.focus();

        return;

    }


    if (!password) {

        errorBox.textContent =
            "비밀번호를 입력해주세요.";

        passwordInput.focus();

        return;

    }


    /*
     * 로그인 중 버튼 잠금
     */

    loginButton.disabled = true;

    loginButton.textContent =
        "로그인 중...";


    try {

        /*
         * Supabase Auth 로그인
         */

        const {
            data,
            error
        } = await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password

            });


        /*
         * 로그인 실패
         */

        if (error) {

            console.error(
                "Supabase 로그인 오류:",
                error
            );

            errorBox.textContent =
                error.message;

            return;

        }


        /*
         * 로그인 결과 확인
         */

        if (
            !data
            || !data.user
        ) {

            errorBox.textContent =
                "로그인은 되었지만 사용자 정보를 확인할 수 없습니다.";

            return;

        }


        /*
         * 현재 로그인 사용자의 profile 확인
         */

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
                data.user.id
            )
            .maybeSingle();


        /*
         * profile 조회 오류
         */

        if (profileError) {

            console.error(
                "Profile 조회 오류:",
                profileError
            );

            await supabaseClient.auth.signOut();

            errorBox.textContent =
                "로그인은 되었지만 관리자 정보를 확인하지 못했습니다.";

            return;

        }


        /*
         * 관리자 권한 확인
         */

        if (
            !profile
            || !profile.can_manage_news
        ) {

            await supabaseClient.auth.signOut();

            errorBox.textContent =
                "이 계정에는 관리자 권한이 없습니다.";

            return;

        }


        /*
         * 최종 관리자 로그인 성공
         */

        isAdmin = true;

        updateAdminUI();

        await openNewsList();


    } catch (error) {

        console.error(
            "로그인 처리 중 예외:",
            error
        );

        errorBox.textContent =
            error.message
            || "로그인 중 오류가 발생했습니다.";

    } finally {

        loginButton.disabled = false;

        loginButton.textContent =
            "관리자 로그인";

    }

}


/* ==================================================
   로그아웃
================================================== */

async function logoutAdmin() {

    try {

        await supabaseClient.auth.signOut();

    } catch (error) {

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
        } = await supabaseClient.auth
            .getSession();


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
        } = await supabaseClient.auth
            .getUser();


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

    writeScreen.classList.add(
        "visible"
    );

    activateNewsMenu();

    scrollTop();

}


/* ==================================================
   기부
================================================== */

function openDonation() {

    hideAllScreens();

    donationScreen.classList.add(
        "visible"
    );

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
            "소식을 불러오지 못했습니다.\n\n"
            + error.message
        );

        return [];

    }


    return data || [];

}


/* ==================================================
   날짜 포맷
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
   소식 목록 표시
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


    /*
     * 소식 없음
     */

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


    /*
     * 소식 있음
     */

    container.innerHTML = "";


    const list =
        document.createElement(
            "div"
        );


    list.className =
        "news-list";


    newsList.forEach(function(news) {

        const row =
            document.createElement(
                "button"
            );


        row.type =
            "button";

        row.className =
            "news-row";


        row.innerHTML = `

            <span class="news-author">
                (${escapeHTML(news.author)})
            </span>

            <span class="news-title">
                ${escapeHTML(news.title)}
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


        list.appendChild(
            row
        );

    });


    container.appendChild(
        list
    );

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

        console.error(
            "상세 소식 오류:",
            error
        );

        alert(
            "소식을 불러오지 못했습니다.\n\n"
            + error.message
        );

        return;

    }


    currentNewsId =
        news.id;


    hideAllScreens();

    detailScreen.classList.add(
        "visible"
    );

    activateNewsMenu();


    const detailContainer =
        document.getElementById(
            "news-detail-container"
        );


    detailContainer.innerHTML = `

        <div class="detail-author">
            (${escapeHTML(news.author)})
        </div>

        <div class="detail-title-line">

            <h1 class="detail-title">
                ${escapeHTML(news.title)}
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


    const {
        data: userData,
        error: userError
    } = await supabaseClient.auth
        .getUser();


    if (
        userError
        || !userData
        || !userData.user
    ) {

        isAdmin = false;

        updateAdminUI();

        alert(
            "관리자 로그인이 필요합니다."
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


    if (
        profileError
        || !profile
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

        console.error(
            "소식 등록 오류:",
            error
        );

        alert(
            "소식을 등록하지 못했습니다.\n\n"
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

        console.error(
            "소식 삭제 오류:",
            error
        );

        alert(
            "소식을 삭제하지 못했습니다.\n\n"
            + error.message
        );

        return;

    }


    currentNewsId =
        null;


    await openNewsList();

}


/* ==================================================
   HTML 안전 처리
================================================== */

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


/* ==================================================
   메인 영역 스크롤 위로
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
   이벤트 연결
================================================== */

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
        "adminButton"
    )
    .addEventListener(
        "click",
        openAdminLogin
    );


document
    .getElementById(
        "admin-login-submit"
    )
    .addEventListener(
        "click",
        loginAdmin
    );


document
    .getElementById(
        "cancel-login"
    )
    .addEventListener(
        "click",
        openNewsIntro
    );


document
    .getElementById(
        "admin-password"
    )
    .addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

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
