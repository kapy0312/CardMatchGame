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



window.addEventListener("load", function () {

    Step = 1;

    LoadGoolgeData_20();

    //var n1=1;
});

$('.resetbtn').click(function () {

    location.reload();

    // Step = 1;

    // LoadGoolgeData_20();

});

function LoadGoolgeData_20() {
    event.preventDefault();

    $('#overlay').show();

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

            // RandomCardItems = CardItems.slice(0, RandomCardItems.length - 20);; // 使用 slice() 複製一份新的陣列

            shuffleArray(RandomCardItems);// Shuffle the array

            LoadCardData();
            // CardItems = JSON.parse(data).flat();
            $('#overlay').hide();

            // alert("載入完成");
        },
        error: function () {
            alert('Request Failed'); // 处理错误情况
        }
    });
}

function LoadCardData() {

    // var dataURL = canvas.toDataURL(); 將 canvas 轉換為 base64 圖片數據
    var canvas, ctx, dataURL;
    var cardContainer = document.querySelector(".card-container");// 獲取 card-container 容器元素
    var frontElements = cardContainer.querySelectorAll(".front");// 獲取所有的 back 元素

    // 遍歷 back 元素並設置背景圖片
    frontElements.forEach(function (backElement, index) {
        canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 150;
        ctx = canvas.getContext("2d");

        // Set canvas background color
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set text properties
        ctx.font = "16px Arial";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";

        // Draw text with line break
        var text = isChineseOrEnglish(RandomCardItems[index]) + "\n" + RandomCardItems[index];
        var textX = canvas.width / 2;
        var textY = canvas.height / 2;
        var lineHeight = 20;
        var lines = text.split("\n");
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], textX, textY - (lines.length - 1) * lineHeight / 2 + i * lineHeight);
        }

        dataURL = canvas.toDataURL();
        backElement.style.backgroundImage = "url('" + dataURL + "')";
    });
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
                //box.off('animationend', onAnimationEnd);
                // $(".box:nth-child(1)").off();
                // $(".box:nth-child(2)").off();
                // $(".box").off();
                // box1.removeOnclick();
                // box2.removeOnclick();

            } else {
                box1.addClass("flipped2");
                box2.addClass("flipped2");
                Isback = true;
                // box1.removeClass("flipped1");
                // box2.removeClass("flipped1");
            }
            // box = null;
            // box1 = null;
            // box2 = null;
            Step = 1;
            PairItems1 = "";
            PairItems2 = "";
            PairItemsIndex1 = 0;
            PairItemsIndex2 = 0;
            animationRunning = false;
            // box.off('animationend', onAnimationEnd);
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

// function flipCard(card) {
//     card.classList.toggle('flipped');
// }

function bk() {

    //如果其他卡牌動畫還在就不執行以下程式
    if (!flipCardRun) {

        var box = $(`.box:nth-child(${cardNumber + 1})`);
        var box1, box2;
        flipCardRun = true;
        box.addClass("flipped1");

        // 偵聽動畫結束事件，以便在動畫完成後移除 flipped 類別
        box.on('animationend', function () {

            if (!reBack) {
                if (Step == 1) {

                    CardItems.forEach(function (element, index) {
                        if (element === RandomCardItems[cardNumber]) {

                            PairItems1 = element;
                            PairItemsIndex1 = cardNumber;
                            if (isChineseOrEnglish(element) === "中文") {
                                PairItems2 = CardItems[index - 1];
                            } else {
                                PairItems2 = CardItems[index + 1];
                            }
                        }
                    });
                    Step = 2;
                    flipCardRun = false;

                } else if (Step == 2) {

                    box1 = $(`.box:nth-child(${PairItemsIndex1 + 1})`);
                    box2 = box;
                    PairItemsIndex2 = cardNumber;

                    if (RandomCardItems[cardNumber] === PairItems2) {
                        box1.off("click");
                        box2.off("click");
                    } else {
                        // box1.removeClass("flipped");
                        // box2.removeClass("flipped");
                        // reBack = true;
                        // Step = 1;
                        // box1.addClass("flipped2");
                        // box2.addClass("flipped2");
                        box1.removeClass("flipped1");
                        box1.removeClass("flipped2");
                        box2.removeClass("flipped1");
                        box2.removeClass("flipped2");
                    }
                    box1 = null;
                    box2 = null;
                    Step = 1;
                    PairItems1 = "";
                    PairItems2 = "";
                    PairItemsIndex1 = 0;
                    PairItemsIndex2 = 0;
                    flipCardRun = false;
                }

            } else {
                //把牌翻回去
                box1.removeClass("flipped1");
                box1.removeClass("flipped2");
                box2.removeClass("flipped1");
                box2.removeClass("flipped2");
                Step = 1;
                PairItems1 = "";
                PairItems2 = "";
                PairItemsIndex1 = 0;
                PairItemsIndex2 = 0;
                reBack = false;
                flipCardRun = false;
            }

        });
    }
    // alert(cardNumber + ":" + RandomCardItems[cardNumber]);

}