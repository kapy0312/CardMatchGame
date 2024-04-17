// Initialize array with values 0 to 6
//var cardArray = Array.from({ length: 7 }, (_, index) => index);

var CardItems, RandomCardItems;
var Step, Score = 0;;
var ScoreElement = $("#score");
var PairItems1 = "", PairItems2 = "";
var PairItemsIndex1 = 0, PairItemsIndex2 = 0;
var reBack = false, flipCardRun = false, animationRunning = false;
var box, box1, box2;
var FlopArray = new Array(20).fill(false);
var img = new Image();
var startTime, timerInterval;

window.addEventListener("load", function () {

    Step = 1;

    LoadGoolgeData_20();

    //var n1=1;
});

$('.resetbtn').click(function () {

    location.reload();
    // $('#overlayGameOver').addClass('overlayVisible');
    // $("#overlayGameOver").show();
    // Step = 1;

    // LoadGoolgeData_20();

});

function updateTime() {
    // 獲取當前時間
    var currentTime = Date.now();

    // 計算經過的時間（以秒為單位）
    var elapsedTimeInSeconds = Math.floor((currentTime - startTime) / 1000);

    // 更新顯示時間
    $('#time').text(elapsedTimeInSeconds);
}


function LoadGoolgeData_20() {
    event.preventDefault();

    $('#overlay').show();
    // overlayGameOver.classList.add("hidden");

    var DataArray = new Array(100);
    DataArray[0] = 1;

    $.ajax({
        url: google_apps_script_url,
        type: 'POST',
        dataType: 'text',
        data: JSON.stringify({ DataArray: DataArray }),
        contentType: 'text/plain; charset=utf-8',
        success: function (data) {
            // LoginResponseResults(data);
            // var array = JSON.parse(data);

            CardItems = JSON.parse(data).flat().filter(function (item) {
                return item !== "中文" && item !== "英文";
            });

            RandomCardItems = CardItems.slice(0, 20);

            //shuffleArray(RandomCardItems);// Shuffle the array

            LoadCardData();
            // CardItems = JSON.parse(data).flat();
            $('#overlay').hide();

            //開始計時
            startTime = Date.now();
            timerInterval = setInterval(updateTime, 1000);

            // alert("載入完成");
        },
        error: function () {
            alert('Request Failed'); // 处理错误情况
        }
    });
}

function LoadCardData() {
    var cardContainer = document.querySelector(".card-container");
    // var frontElements = cardContainer.querySelectorAll(".front");
    var canvasesElements = document.querySelectorAll(".card.front");
    var img = new Image();
    img.src = 'img/牌面.png';
    img.onload = function () {
        canvasesElements.forEach(function (canvas, index) {
            canvas.width = 100;
            canvas.height = 150;
            var ctx = canvas.getContext("2d");

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            ctx.font = "16px GenSenRounded-B";
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";

            // var text = isChineseOrEnglish(RandomCardItems[index]) + "\n" + RandomCardItems[index];
            var text = RandomCardItems[index];
            var textX = canvas.width / 2;
            var textY = canvas.height / 2;

            if (text.includes("http")) {
                var img1 = new Image();
                img1.src = text;
                img1.onload = function () {
                    var img1Width = 80;
                    var img1Height = img1.height * (80 / img1.width);
                    ctx.drawImage(img1, textX - (img1Width / 2), textY - (img1Height / 2), img1Width, img1Height);
                }
            } else {
                var lineHeight = 20;
                var lines = text.split("\n");
                for (var i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], textX, textY - (lines.length - 1) * lineHeight / 2 + i * lineHeight);
                }

            }

            // var dataURL = canvas.toDataURL();
            // backElement.style.backgroundImage = "url('" + dataURL + "')";
        });
    };
}

function flipCard(cardNumber) {

    //如果其他卡牌動畫還在就不執行以下程式
    if (!animationRunning && !FlopArray[cardNumber]) {

        // flipCardRun = true;
        box = $(`.box:nth-child(${cardNumber + 1})`);
        box.addClass("flipped1");

        // 偵聽動畫結束事件，以便在動畫完成後移除 flipped 類別
        onAncardNumber = cardNumber;
        box.on('animationstart', startAnimation);
        box.on('animationend', onAnimationEnd);

    }
    // alert(cardNumber + ":" + RandomCardItems[cardNumber]);
}



function startAnimation() {
    animationRunning = true;
    box.off('animationstart', animationRunning);
    // 执行动画的代码
}

var onAncardNumber, Isback = false;
function onAnimationEnd() {
    // 在這裡處理動畫結束事件
    if (!Isback) {
        if (Step == 1) {

            CardItems.forEach(function (element, index) {
                if (element === RandomCardItems[onAncardNumber]) {

                    PairItems1 = element;
                    PairItemsIndex1 = onAncardNumber;
                    if (isChineseOrEnglish(element) === "中文") {
                        PairItems2 = CardItems[index - 1];
                    } else {
                        PairItems2 = CardItems[index + 1];
                    }
                }
            });
            box1 = $(`.box:nth-child(${onAncardNumber + 1})`);
            Step = 2;
            animationRunning = false;
            box.off('animationend', onAnimationEnd);

        } else if (Step == 2) {

            box2 = $(`.box:nth-child(${onAncardNumber + 1})`);
            PairItemsIndex2 = onAncardNumber;

            if (RandomCardItems[onAncardNumber] === PairItems2) {
                Step = 1;
                Score = Score + 2;
                updateScore(Score);
                FlopArray[PairItemsIndex1] = true;
                FlopArray[PairItemsIndex2] = true;

                if (Score == 20) {
                    // overlayGameOver.classList.remove("hidden");
                    $('#overlayGameOver').addClass('overlayVisible');
                    $("#overlayGameOver").show();
                    clearInterval(timerInterval); // 清除計時器
                    $('#score2').text($('#score').text());
                    $('#time2').text($('#time').text());
                }
            } else {
                box1.addClass("flipped2");
                box2.addClass("flipped2");
                Isback = true;
            }
            Step = 1;
            PairItems1 = "";
            PairItems2 = "";
            PairItemsIndex1 = 0;
            PairItemsIndex2 = 0;
            animationRunning = false;
        }
    } else {
        box1.removeClass("flipped1");
        box2.removeClass("flipped1");
        box1.removeClass("flipped2");
        box2.removeClass("flipped2");
        animationRunning = false;
        Isback = false;
        box.off('animationend', onAnimationEnd);
    }
}


function updateScore(newScore) {
    ScoreElement.text(newScore);
}
// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function isChineseOrEnglish(str) {
    var str = str.replace(/\s/g, ""); // 使用正則表達式將所有空格替換成空字符串
    var chinesePattern = /[\u4E00-\u9FA5]/; // 中文字符的 Unicode 範圍
    var englishPattern = /^[A-Za-z]+$/; // 英文字符的正則表達式
    if (chinesePattern.test(str)) {
        return '中文';
    } else if (englishPattern.test(str)) {
        return 'English';
    } else {
        return '其他';
    }
}

function bk() {

}