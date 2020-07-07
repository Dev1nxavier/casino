//Roulette V3
//2020 S.Greene

//keep track of bets placed on table. Update each object for player bets

const gameState = {
    playerCash: {
        'total':1000,
    },
    table:{
        zeros: {
            '0':{bets: 0, ball: false},
            '00':{bets: 0, ball: false},
        },

        numbers:{
           
        },
        outsideBets:{
            dozens: {
                '1stDozen': {bets: 0, ball: false},
                '2ndDozen': {bets: 0, ball: false},
                '3rdDozen': {bets: 0, ball: false},
            },
            colors: {
                '1to18': {bets: 0, ball: false},
                'even': {bets: 0, ball: false},
                'red': {bets: 0, ball: false},
                'black': {bets: 0, ball: false},
                'odd': {bets: 0, ball: false},
                '19to36': {bets: 0, ball: false},
            },
            
        },
        columns: {
            '2to1_1': {bets: 0, ball: false},
            '2to1_2': {bets: 0, ball: false},
            '2to1_3': {bets: 0, ball: false},
        }
    },
    playerBet:0,
    ante:0,

}

const ballHistory = [];
let timeOut;

function renderGameState(){

    initializeGameStateObjects();
    renderGameBoard();
    initDashboard();
    
}

function renderGameBoard(){

    let tableObj;

    $('.outsides_container .dozens_container').empty();
    for(let bet in gameState.table.outsideBets.dozens){
        //get tableObject
        tableObj = gameState.table.outsideBets.dozens[bet];

        //clear previous bets
        tableObj.bets = 0;
        //append dozens
        $('.outsides_container .dozens_container').append(createTableDiv(tableObj, bet, 'dozens'));
    
    }

    $('.outsides_container .bins_container').empty();
    for(let bet in gameState.table.outsideBets.colors){
        //get tableObject:
        tableObj = gameState.table.outsideBets.colors[bet];

        //clear previous bets
        tableObj.bets = 0;

        //append outsideBets
        $('.outsides_container .bins_container').append(createTableDiv(tableObj, bet, 'outsides'));

    }

    $('.insides_container .lanes_container').empty();
    for(let bet in gameState.table.columns){
        tableObj = gameState.table.columns[bet];

        //clear previous bets
        tableObj.bets = 0;

        //append column bets
        $('.insides_container .lanes_container').append(createTableDiv(tableObj, '2to1', '2to1'));
    }

    $('.zeros_container').empty();
    for(let bet in gameState.table.zeros){
        tableObj = gameState.table.zeros[bet];

        //clear previous bets
        tableObj.bets = 0;

        //append zeros
        $('.zeros_container').append(createTableDiv(tableObj, bet, 'tableNumber zero'));
    }

    $('.numbersBoard_container').empty();
    for (let index = 36; index>0; index--) {
            //append numbers bets
        const nmbrObj = gameState.table.numbers[setKey(index)];    
        const newDiv = createTableDiv(nmbrObj, setKey(index), 'tableNumber')
        newDiv.addClass(`${nmbrObj.color}`)
        $('.numbersBoard_container').append(newDiv);

   }

}

function createTableDiv(tableObject, objectKey, betType){
    let tableDiv = $(`<div class =  "${objectKey} ${betType} clickable"><h4>${objectKey}</h4></div>`);

    tableDiv.data("tableObject", tableObject);

    return tableDiv;
}

function initializeGameStateObjects(){
    //TODO: update gameState with object for each number
    for (let tableNumber = 1; tableNumber < 37; tableNumber++) {

            tableObjectsArray(tableNumber);
            gameState.table.numbers[setKey(tableNumber)].color = numColor(tableNumber);
        } 
}

function tableObjectsArray(key) {
    gameState.table.numbers[setKey(key)] = boardObject();
}

function boardObject() {

    let item = {
        bets:0,
        ball: false,
    }  
    return item;   
}  

function setKey(key) {

    if (key<10) {
        key = `0${key}`
    }
    return `${key}`;
}

function wheelSpin() {

    console.log('WheelSpin Called');
    //TODO: Create wheel function for determining position of ball on wheel
    clearTimeout(timeOut);

    let min = Math.ceil(0);
    let max = Math.floor(37);
    let ball = Math.floor(Math.random()*(max-min))+min;

    ballHistory.unshift(ball);
    if (ballHistory.length>5) {
        ballHistory.pop();
    }
    
    let totalWinnings = winningBets(ball);
    console.log('WheelSpin: Total Winnings', typeof totalWinnings);
   
    gameState.playerCash.total = +gameState.playerCash.total + totalWinnings;
    gameState.playerBet = 0;
    savePlayerState();
    renderGameState();

}

function initDashboard() {

    $('.leaderBoard .number_selected').text(ballHistory[0]);
    $('.bouncing_ball img').removeClass('bounce');
    $('#wheel').removeClass('spin');
    $('.place_bets .playerCash h2').text(gameState.playerCash.total);
    $('.place_bets .currentAnte h2').text(gameState.playerBet);
    
    console.log('initDashboard: ', gameState.playerCash.total);
    leaderBoard();

}

function numColor(index){

        let color;

        if (index <11 || 18<index+1<29) {
            if ((index)%2===0) {
                color = 'black';
            }else{
                color = 'red';
            }
        }else if (10<index+1<19 || 28<index+1<37) {
                if ((index+1)%2 === 0) {
                    color = 'red';
                }
        }else{
            color = 'black';
        }
        return color;
}

function leaderBoard() {
    //TODO: Create leader board for displaying past ball positions
    const histCont = $('.history_container .history_spins');
    histCont.empty();

    if (ballHistory.length>0) {
        ballHistory.forEach(function(ball){
            const histDiv = $(`<div class= "history ${numColor(setKey(ball))}"><h1>${ball}</h1></div>`);
    
            histCont.append(histDiv);
        })
        
    }
}

function splitsAndCornersBets($this) {

    const numberClicked = $this.closest('.tableNumber');
    let objectKey = numberClicked.attr('class').split(' ')[0];
    numberClicked.addClass('splitBet blue');
}

$('.splits_corners button').click(function(){

    if ($(this).attr('id')=== 'split') {

        let splits = $('.splitBet');

        //check to make sure only two numbers are selected
        if (splits.length!==2) {
            $('.splitBet').removeClass('splitBet');
           invalidBets()
            return; 
        }
        
        const selectionOne = $(splits[0]).attr('class').split(' ')[0];
        const selectionTwo = $(splits[1]).attr('class').split(' ')[0];

        //check to make sure only adjacent cells
            //1st check: if more than 1 space apart:
        if (Math.abs(selectionTwo - selectionOne)>3) {
           invalidBets();

           //check if adjacent
        }else if ((selectionOne * selectionTwo)%2 !== 0) {
            invalidBets();

        }else{
            //finally a valid bet!
                gameState.ante = gameState.ante/2;

                for (let index = 0; index < splits.length; index++) {
                    placeBet($(splits[index]));
                    
                }
            }
            gameState.ante = gameState.ante * 2; 
            
    }
})

function invalidBets(){
    alert('Please select only two adjacent cells for split bets');
    $('.splitBet').removeClass('splitBet blue');

}

let playerSumBets = 0;

function placeBet($this) {
    //subtract from player cash
    let cash = gameState.playerCash.total;
    let ante = gameState.ante;
    
    if (ante<1) {
        alert('Please select bet amount');
        $('.splitBet').removeClass('splitBet blue');
        return;
    }

    if (cash>=ante) {
        cash -=ante;
        placeChips($this);
        $('.splitBet').removeClass('splitBet');
        gameState.playerBet +=ante;
        let thisBet = $this.data('tableObject').bets+=ante;

    }else{
        alert('Cash depleted. No more bets');
    }
    gameState.playerCash.total = cash;
    

    $('.place_bets .currentAnte h2').text(gameState.playerBet);
    $('.place_bets .playerCash h2').text(gameState.playerCash.total);
    console.log('placeBet cash: ', gameState.playerCash.total);
}

function winHistory(bet){
    $('.history_bets').append(`<div class = "winningBetType">${bet}</div>`);
}

function winningBets(ball) {
    //TODO: check for winning bets comparing ball number to gameState
    const gameBoard = gameState.table;
    let winValue = 0;

    let numBet =0;
    //check inside number bets

    if (ball === 0) {
        
            let randZero = Math.floor(Math.random() * (2));
            console.log('Random Zero: ',randZero);
            if (randZero === 0) {
                console.log('one Zero');
                numBet = gameState.table.zeros[0].bets*36;
            }else{
                console.log('two zeros');
                numBet = gameState.table.zeros[00].bets *36;
            }
          }else{

        numBet = gameState.table.numbers[setKey(ball)]['bets']*36;
    }

    winValue +=numBet;
    winValue>0?winHistory(`Number Bet: ${winValue}`):"";

    //Check outside bets
    const ballVal = ball;

    let outBet = 0;
    if (ballVal<19) {
        outBet = gameBoard.outsideBets.colors["1to18"].bets*2;
    }else{
        outBet = gameBoard.outsideBets.colors["19to36"].bets*2;
    }

    outBet>0?winHistory(`Outside Bet: ${outBet}`):"";

    winValue += outBet;

    let oddsEvens = 0;
    let which;
    //check even/odd bets
    if (ballVal%2==0) {
        //if even:
        oddsEvens = gameBoard.outsideBets.colors.even.bets*2;
        which = 'Even';
    }else{
        oddsEvens = gameBoard.outsideBets.colors.odd.bets*2;
        which = 'odd';
    }

    winValue += oddsEvens;

    oddsEvens>0?winHistory(`${which} Bet: ${oddsEvens}`):'';

    //check dozens
    let whichDozen;
    let dozenBet =0;
    if (ballVal<13) {
        dozenBet=gameBoard.outsideBets.dozens["1stDozen"].bets*3;
        whichDozen = '1stDozen'
    }else if (ballVal<25) {
        dozenBet=gameBoard.outsideBets.dozens["2ndDozen"].bets*3;
        whichDozen = '2ndDozen';
    }else{
        dozenBet=gameBoard.outsideBets.dozens["3rdDozen"].bets*3;
        whichDozen = '3rdDozen';
    }

    dozenBet>0?winHistory(`${whichDozen} Bet: ${dozenBet}`):'';
    winValue+=dozenBet;



    //check column bets
    let colValue = ballVal;
    let betvalue=0;

    while(colValue>3){
        colValue = colValue-3;
    }

    switch (colValue) {
        case 1:
            betvalue = gameBoard.columns["2to1_3"].bets * 3;
            // console.log('bet value C1 Wins! Bet Value: ', betvalue);
            break;
        case 2:
            // console.log('bet value C2 Wins! Bet Value: ', betvalue);
            betvalue = gameBoard.columns[`2to1_2`].bets * 3;
            break;
        case 3:
            betvalue =gameBoard.columns[`2to1_1`].bets * 3;
            // console.log('bet value C3 Wins! Bet Value: ', betvalue);
            break;
        default:
            break;
    }
    
    betvalue>0?winHistory(`Column bet payout: ${betvalue}`):'';
    winValue +=betvalue;

    //check red & black bets
    let redBlack = 0;
    let ballColor = numColor(ballVal);

    // console.log('ball color: ', ballColor);

    if ( ballColor == 'red' ) {
        redBlack = gameBoard.outsideBets.colors.red.bets*2;
    }else if (ballColor == 'black') {
        redBlack = gameBoard.outsideBets.colors.black.bets*2;
    }

    redBlack>0?winHistory(`${ballColor} bet payout: ${redBlack}`):'';
    // console.log('Winnings from color bets: ', redBlack);

    winValue += redBlack;

    if (winValue>0) {
        $('#winning')[0].play();
    }

    return winValue;
}

function savePlayerState() {
    //TODO: save player state
    let savePlayerCash = localStorage.setItem('playerCash', gameState.playerCash.total);
    console.log('savePlayerState cash: ', gameState.playerCash.total);
}

function loadPlayerState() {
    //TODO: load player state
    let loadPlayerCash = localStorage.getItem('playerCash');
    if (loadPlayerCash) {
        gameState.playerCash.total = loadPlayerCash;
        console.log('loadPlayerState cash: ', gameState.playerCash.total);
    }else{
        gameState.playerCash.total = 1000;
    }

}

function placeChips(location){
    $this = location;

    try {
        $this.addClass("playerBet");
    } catch (error) {
        console.log(error);
        return;
    }
    
}

function setClickListeners(){

    // $('.clickable').on('click', function(event){
    $('.board').on('click', '.clickable', function(){

        $('.history_bets').empty();
        let $this = $(this);

        if ($this.hasClass('tableNumber')) {
            if (event.shiftKey) {
                // cornerBets($this);
                splitsAndCornersBets($this);
                return;
            }
        }

        placeBet($this);
        // console.log(`${$this} : ${$this.data('tableObject')}`);
    })

    //Spin the wheel
    $('#wheel').on('click', function(){
       
            $('#wheel').addClass('spin');
            $('#wheelSpin')[0].play();
            $('.bouncing_ball img').addClass('bounce');
    
            timeOut = setTimeout(wheelSpin, 2500);
    
        
        
    });

 //select ante value
    $('.chip').on('click', function(event){
        $('.player_chips .chip').removeClass('selected');
        const ante = Number($(this).attr('id'));
        $(this).addClass('selected');

        //update gameState with ante
        gameState.ante = ante;
    })

    $('.questions').click(function(){
        $('.modal').toggleClass('open');
    })

    $('#close_modal').click(function(){
        $('.modal.open').removeClass('open');
    })


}

$(function(){

    loadPlayerState();
    renderGameState();
    setClickListeners();
})

