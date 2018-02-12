$(document).ready(function() {

	let X = {
		isComputer: false,
		symbol: "x",
		marker: "<img src='img/x.png'>",
		winMarker: "<img src='img/xWin.png'>"
	}
	let O = {
		isComputer: false,
		symbol: "o",
		marker: "<img src='img/o.png'>",
		winMarker: "<img src='img/oWin.png'>"
	}
	let game = {
		board: [0,1,2,3,4,5,6,7,8],
		firstTurn: X,
		xScore: 0,
		oScore: 0,
		turnNumber: 0,
		started: false
	}
	let winningCombos = [
		[0,1,2], [3,4,5], [6,7,8], // Rows
		[0,3,6], [1,4,7], [2,5,8], // Columns
		[0,4,8], [2,4,6]		   // X
	];
	let theWinningCombo,
		player = X,
		clearBoardTimeoutID;

	function clearBoardForNextGame() {

		clearBoardTimeoutID = 
		setTimeout(function() {
			$('.square').empty();
			game.firstTurn = game.firstTurn == X ? O : X;
			game.turnNumber = 0;
			game.board = [0,1,2,3,4,5,6,7,8];
			game.started = true;

			if (O.isComputer && game.firstTurn == O || X.isComputer && game.firstTurn == X) {
				AImove(game.firstTurn, game.board);
			}
		}, 1500);
	}

	function thisPlayerWon(board, symbol) {

		for (let i = 0; i < winningCombos.length; i++) {
			let counter = 0;
			for (let j = 0; j < winningCombos[i].length; j++) {
				if (board[winningCombos[i][j]] == symbol) {
					counter++;
				}
				if (counter == 3) {
					theWinningCombo = winningCombos[i];
					return true;
				}
			}
		}
		return false;
	}

	function showWinnerAndUpdateScore(combo, player) {

		game.started = false;
		combo.forEach(index => $('#' + index).html(player.winMarker) );
		player == X ? (game.xScore++, $('#score1').text(game.xScore)) : (game.oScore++, $('#score2').text(game.oScore))
	}

	function AImove(AIplayer, board) {

		AIplayer = !(game.turnNumber % 2) ? game.firstTurn : (game.firstTurn == X ? O : X);
		let opponent = AIplayer == X ? O : X;

		let bestMove = minimax(AIplayer, board, 0).move;
		board[bestMove] = AIplayer.symbol;
		$('#' + bestMove).html(AIplayer.marker);
		game.turnNumber++;

		if (game.turnNumber > 3 && thisPlayerWon(game.board, AIplayer.symbol)) {

			showWinnerAndUpdateScore(theWinningCombo, AIplayer);

			clearBoardForNextGame();
		}
		else if (game.turnNumber == 9) {

			clearBoardForNextGame();
		}
		else if (X.isComputer && O.isComputer) {

			AImove(AIplayer, game.board);
		}

		// Minimax algorithm inspired by https://www.neverstopbuilding.com/blog/2013/12/13/tic-tac-toe-understanding-the-minimax-algorithm13

		// Personal Note: It took me a while to fundamentally understand the logic of this algorithm to the point where I can write out my own version
		// 				  and even after I did, there was a bug within the code that I just could not find and it was causing the AI to not make the
		//				  most optimal move. I tinkered with it for two days until I finally decided to reach out to Stackoverflow for help and it was
		//				  here: https://stackoverflow.com/questions/48734323/why-is-my-minimax-algorithm-not-producing-correct-moves/48736063#48736063 
		//				  where user Trincot helped me understand where I went wrong. I was finally able to completely understand the workings of this
		//				  algorithm and needless to say I was very relieved that I was finally able to get my game to work. I struggled big time but it
		//				  was worth it. Very interesting and fun project.
		//The Problem: Only when a terminal state is reached that a score is returned, in all other cases a move index is returned which causes the computer
		//			   to filter through results that have both scores and move indexes and therefore breaking the logic. This was due to myself not completely
		//			   understanding the algorithm and the purpose of each section and recursive loop.
		//The Solution: Create an object that stores both the score and the move indexes, thus separating but also combining the two pieces of key information
		//				into one where the algorithm can now extract each when needed.

		function minimax(player, board, depth) {

			let spotsNotMarked = emptyBoardSpots(board);

			if (thisPlayerWon(board, AIplayer.symbol)) {
				return {score: 10-depth};
			}
			else if (thisPlayerWon(board, opponent.symbol)) {
				return {score: depth-10};
			}
			else if (spotsNotMarked.length == 0) {
				return {score: 0};
			}

			let moves = [];
			let scores = [];

			for (let i = 0; i < spotsNotMarked.length; i++) {

				let index = spotsNotMarked[i];

				board[index] = player.symbol;

				if (player == AIplayer) {
					let score = minimax(opponent, board, depth+1).score;
					scores.push(score);
				}
				else {
					let score = minimax(AIplayer, board, depth+1).score;
					scores.push(score);
				}

				board[index] = index;

				moves.push(index);
			}

			let score = player == AIplayer ? Math.max(...scores) : Math.min(...scores);

			return {
				score,
				move: moves[scores.indexOf(score)]
			};
		}
	}

	function emptyBoardSpots(board) {

		return board.filter(square => !isNaN(square));
	}

	$('.AI-Switch').on('change', function() {

		if (!game.started) {
			this.id == "one" ? X.isComputer = !(X.isComputer) : O.isComputer = !(O.isComputer);
			X.isComputer ? $('#p1').text('Computer X') : $('#p1').text('Player X');
			O.isComputer ? $('#p2').text('Computer O') : $('#p2').text('Player O');
		}
	});

	$('#resetButton').on('click', function() {

		clearTimeout(clearBoardTimeoutID);
		$('.square').empty();
		$('.scores').text("0");
		game.board = [0,1,2,3,4,5,6,7,8];
		game.firstTurn = X;
		game.xScore = 0;
		game.oScore = 0;
		game.turnNumber = 0;
		game.started = false;
	});

	$('#startButton').on('click', function() {

		game.started = true;

		if (X.isComputer && game.firstTurn == X) {
			AImove(game.firstTurn, game.board);
		}
	});

	$('.square').on('click', function() {

		if (game.started && !isNaN(game.board[this.id])) {

			player = !(game.turnNumber % 2) ? game.firstTurn : (game.firstTurn == X ? O : X);

			this.innerHTML = player.marker;
			game.board[this.id] = player.symbol;

			game.turnNumber++;

			if (game.turnNumber > 3 && thisPlayerWon(game.board, player.symbol)) {

				showWinnerAndUpdateScore(theWinningCombo, player);

				clearBoardForNextGame();
			}
			else if (game.turnNumber == 9) {
				clearBoardForNextGame();
			}

			if (O.isComputer && player == X || X.isComputer && player == O) {
				AImove(player, game.board);
			}
		}
	});
});