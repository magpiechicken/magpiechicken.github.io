"use strict";

/* ==================================================
   저장 키
   이전 테스트 데이터와 분리하기 위해 새 키 사용
================================================== */

const STORAGE_KEY = "kkachi_chicken_news_v2";


/* ==================================================
   페이지 요소
================================================== */

const newsIntro = document.getElementById("newsIntro");
const newsListPage = document.getElementById("newsListPage");
const newsDetailPage = document.getElementById("newsDetailPage");
const writePage = document.getElementById("writePage");
const donationPage = document.getElementById("donationPage");

const newsMenu = document.getElementById("newsMenu");
const donationMenu = document.getElementById("donationMenu");

const newsList = document.getElementById("newsList");
const newsDetailContent =
    document.getElementById("newsDetailContent");


/* ==================================================
   모든 페이지 숨기기
================================================== */

function hideAllPages() {
    newsIntro.classList.remove("active-page");
    newsListPage.classList.remove("active-page");
    newsDetailPage.classList.remove("active-page");
    writePage.classList.remove("active-page");
    donationPage.classList.remove("active-page");
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
   소식 소개 화면
================================================== */

function showNewsIntro() {
    hideAllPages();

    newsIntro.classList.add("active-page");

    activateNewsMenu();
}


/* ==================================================
   소식 목록 화면
================================================== */

function showNewsList() {
    hideAllPages();

    newsListPage.classList.add("active-page");

    activateNewsMenu();

    renderNewsList();
}


/* ==================================================
   상세 화면
================================================== */

function showNewsDetail(id) {
    const newsItems = getNewsList();

    const news = newsItems.find(function(item) {
        return item.id === id;
    });

    if (!news) {
        return;
    }

    hideAllPages();

    newsDetailPage.classList.add("active-page");

    activateNewsMenu();

    newsDetailContent.innerHTML = `
        <div class="detail-author">
            (${escapeHtml(news.author)})
        </div>

        <div class="detail-heading-row">

            <h1 class="detail-title">
                ${escapeHtml(news.title)}
            </h1>

            <span class="detail-date">
                ${escapeHtml(news.date)}
            </span>

        </div>

        <div class="detail-content">
            ${escapeHtml(news.content).replace(/\n/g, "<br>")}
        </div>
    `;

    /* 상세 페이지 위쪽으로 이동 */
    document.querySelector(".main-content").scrollTop = 0;
}


/* ==================================================
   작성 화면
================================================== */

function showWritePage() {
    hideAllPages();

    writePage.classList.add("active-page");

    activateNewsMenu();
}


/* ==================================================
   기부
================================================== */

function showDonation() {
    hideAllPages();

    donationPage.classList.add("active-page");

    activateDonationMenu();
}


/* ==================================================
   소식 가져오기
================================================== */

function getNewsList() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {
        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;
    } catch (error) {
        console.error("소식 데이터를 읽는 중 오류:", error);

        return [];
    }
}


/* ==================================================
   소식 저장
================================================== */

function saveNews() {
    const authorInput =
        document.getElementById("authorInput");

    const titleInput =
        document.getElementById("titleInput");

    const contentInput =
        document.getElementById("contentInput");

    const author = authorInput.value.trim();
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();


    if (author === "") {
        alert("작성자를 입력해주세요.");
        authorInput.focus();
        return;
    }

    if (title === "") {
        alert("제목을 입력해주세요.");
        titleInput.focus();
        return;
    }

    if (content === "") {
        alert("내용을 입력해주세요.");
        contentInput.focus();
        return;
    }


    const now = new Date();

    const date =
        now.getFullYear()
        + "."
        + String(now.getMonth() + 1).padStart(2, "0")
        + "."
        + String(now.getDate()).padStart(2, "0");


    const newNews = {
        id: String(Date.now()),
        author: author,
        title: title,
        content: content,
        date: date
    };


    const newsItems = getNewsList();

    newsItems.unshift(newNews);


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newsItems)
    );


    /* 입력창 비우기 */

    authorInput.value = "";
    titleInput.value = "";
    contentInput.value = "";


    /* 목록으로 이동 */

    showNewsList();
}


/* ==================================================
   목록 표시
================================================== */

function renderNewsList() {
    const newsItems = getNewsList();


    /* ------------------------------------------
       소식이 하나도 없을 경우
    ------------------------------------------ */

    if (newsItems.length === 0) {

        newsList.innerHTML = `
            <div class="empty-news-box">

                <div class="empty-news-icon">
                    —
                </div>

                <div class="empty-news-title">
                    소식 없음
                </div>

                <div class="empty-news-text">
                    현재 등록된 소식이 없습니다.
                </div>

            </div>
        `;

        return;
    }


    /* ------------------------------------------
       소식 목록
    ------------------------------------------ */

    const listWrapper =
        document.createElement("div");

    listWrapper.className = "news-list";


    newsItems.forEach(function(news) {

        const row =
            document.createElement("div");

        row.className = "news-row";

        row.setAttribute("role", "button");
        row.setAttribute("tabindex", "0");


        row.innerHTML = `
            <div class="news-row-author">
                (${escapeHtml(news.author)})
            </div>

            <div class="news-row-title">
                ${escapeHtml(news.title)}
            </div>

            <div class="news-row-date">
                ${escapeHtml(news.date)}
            </div>
        `;


        /* 클릭하면 해당 글만 상세 표시 */

        row.addEventListener("click", function() {
            showNewsDetail(news.id);
        });


        /* 키보드 Enter / Space도 가능 */

        row.addEventListener("keydown", function(event) {

            if (
                event.key === "Enter"
                || event.key === " "
            ) {
                event.preventDefault();

                showNewsDetail(news.id);
            }

        });


        listWrapper.appendChild(row);

    });


    newsList.innerHTML = "";

    newsList.appendChild(listWrapper);


    /* 목록 상단으로 이동 */

    document.querySelector(".main-content").scrollTop = 0;
}


/* ==================================================
   HTML 문자 안전 처리
================================================== */

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==================================================
   버튼 연결
================================================== */

document
    .getElementById("openNewsListButton")
    .addEventListener("click", showNewsList);


document
    .getElementById("openWriteButton")
    .addEventListener("click", showWritePage);


document
    .getElementById("backToNewsListButton")
    .addEventListener("click", showNewsList);


document
    .getElementById("backFromWriteButton")
    .addEventListener("click", showNewsList);


document
    .getElementById("cancelWriteButton")
    .addEventListener("click", showNewsList);


document
    .getElementById("saveNewsButton")
    .addEventListener("click", saveNews);


document
    .getElementById("newsMenu")
    .addEventListener("click", showNewsIntro);


document
    .getElementById("donationMenu")
    .addEventListener("click", showDonation);


/* ==================================================
   첫 화면
================================================== */

showNewsIntro();
