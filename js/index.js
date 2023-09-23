// FUNCTION CALL

loadInitialData("sevenDays");
connectMe("metamask_wallet");
const connectButton = document.getElementById("connectButton");
const walletID = document.getElementById("walletID");

if (typeof window.ethereum !== "undefined") {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        const account = accounts[0]

        walletID.innerHTML = `Wallet connected: ${account}`;
      })
} else {
      window.open("https://metamask.io/download/", "_blank");
}

function connectWallet() {}

function openTab(event, name) {
  console.log(name);
  contractCall = name;
  getSelectedTab(name);
  loadInitialData(name);
}

async function loadInitialData(sClass) {
  console.log(sClass);
  try {
    clearInterval(countDownGlobal);

    let cObj = new webeMain.eth.Contract(
      SELECT_CONNECT[_NETWORK_ID].STACKING.abi,
      SELECT_CONNECT[_NETWORK_ID].STACKING[sClass].address
    );

    // ID ELMENT DATAT
    let totalUsers = await cObj.methods.getTotalUsers().call();
    let cApy = await cObj.methods.getAPY().call();

    // GET USER
    let userDetail = await cObj.methods.getUsers(currentAddress).call();

    const user = {
      lastRewardCalculationTime: userDetail.lastRewardCalculationTime,
      lastStakeTime: userDetail.lastStake,
      rewardAmount: userDetail.rewardAmount,
      rewardsClaimedSoFar: userDetail.rewardClaimedSoFar,
      stakeAmount: userDetail.stakeAmount,
      address: currentAddress,
    };

    localStorage.setItem("User", JSON.stringify(user));

    let userDetailBal = userDetail.stakeAmount / 10 ** 18;

    document.getElementById(
      "total-locked-user-token"
    ).innerHTML = `${userDetailBal}`;

    // ELEMENT  --ID

    document.getElementById(
      "num-of-stackers-value"
    ).innerHTML = `${totalUsers}`;
    document.getElementById("apy-value-feature").innerHTML = `${cApy} %`;

    // CLASS ELEMENT  DATA

    let totalLockedTokens= await cObj.methods.getTotalStakedTokens().call();
    let earlyUnstakeFee = await cObj.methods
      .getEarlyUnstakeFeePercentage()
      .call();

    // ELEMTN  --CLASS

    document.getElementById("total-locked-token-value").innerHTML = `${
      totalLockedTokens / 10 ** 18
    } ${SELECT_CONNECT[_NETWORK_ID].TOKEN.symbol}`;

    document
      .querySelectorAll(".early-unstake-value")
      .forEach(function (element) {
        element.innerHTML = `${earlyUnstakeFee / 100} %`;
      });

    let minStakeAmount = await cObj.methods.getMinimumStakingAmount().call();
    minStakeAmount = Number(minStakeAmount);
    let minA;
    if (minStakeAmount) {
      minA = `${(minStakeAmount / 10 ** 18).toLocaleString()} ${
        SELECT_CONNECT[_NETWORK_ID].TOKEN.symbol
      }`;
    } else {
      minA = "N/A";
    }

    document
      .querySelectorAll(".Minimum-Staking-Amount")
      .forEach(function (element) {
        element.innerHTML = `${minA}`;
      });

    document
      .querySelectorAll(".Minimum-Staking-Amount")
      .forEach(function (element) {
        element.innerHTML = `${(1000000).toLocaleString()} ${
          SELECT_CONNECT[_NETWORK_ID].TOKEN.symbol
        }`;
      });

    let isStakingPaused = await cObj.methods.getStakingStatus().call();
    let isStakingPausedText;

    let startDate = await cObj.methods.getStakingDate().call();
    startDate = Number(startDate) * 1000;

    let endDate = await cObj.methods.getStakeEndDate().call();
    endDate = Number(endDate) * 1000;

    let StakeDays = await cObj.methods.getStakeDays().call();

    let days = math.floor(Number(stakeDays) / (3600 * 24));

    let dayDisplay = days > 0 ? days + (days == 1 ? "day, " : "days") : "";

    document
      .querySelectorAllowMultiple(".Lock-period-value")
      .forEach(function (element) {
        element.innerHTML = `${dayDisplay}`;
      });

    let rewardBal = await cObj.methods
      .getUserEstimatedRewards()
      .call({ from: currentAddress });

    document.getElementById("user-reward-balance-value").value = `Reward ${
      (rewardBal / 10) * 18
    }
            ${SELECT_CONNECT[_NETWORK_ID].TOKEN.symbol}`;

    //user token balance

    let balMainUser = (Number(balMainUser) / 10) * 18;

    document.getElementById("user-token-balance").innerHTML = `${balMainUser}`;

    let currentDate = new Date().getTime();

    if (isStakingPaused) {
      isStakingPausedText = "Paused";
    } else if (currentDate < startDate) {
      isStakingPausedText = "Locked";
    } else if (currentDate > endDate) {
      isStakingPausedText = "Ended";
    } else {
      isStakingPausedText = "Active";
    }

    document
      .querySelectorAll(".active-status-stacking")
      .forEach(function (element) {
        element.innerHTML = `${isStakingPausedText}`;
      });

    if (currentDate > startDate && currentDate < endDate) {
      const ele = document.getElementById("countdown-time-value");
      generateCountDown(ele, endDate);

      document.getElementById("countdown-title-value").innerHTML = `
                        Stacking  Ends In`;
    }
    if (currentDate < startDate) {
      const ele = document.getElementById("countdown-time-value");
      generateCountDown(ele, endDate);

      document.getElementById(
        "countdown-title-value"
      ).innerHTML = `Staking Starts in`;
    }

    document.querySelectorAll(".apy-value").forEach(function (element) {
      element.innerHTML = `${cApy} %`;
    });
  } catch (error) {
    console.log(error);
    notyf.error(
      `Unable to fetch data from ${SELECT_CONNECT[_NETWORK_ID].network_name}! \n  Please refresh  this page`
    );
  }
}

function generateCountDown(ele, claimDate) {
  clearIntervals(countDownGlobal);
  // set the dat we are counting dow to

  var countdown = new Date(claimDate).getTime();

  // update the count down eery 1 second

  countDownGlobal = setInterval(function () {
    // get todays's date and time
    var now = new Date().getTime();
    // find the distance between now and the count down date

    var distance = countDownDate - now;
    // time calculations for days, hours, minutes and seconds

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = math.floor(distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
    var minutes = math.floor(distance % (1000 * 60 * 60)) / (1000 * 60);
    var seconds = math.floor(distance % (1000 * 60)) / 1000;

    // Display the result in the element with id = "demo"
    ele.innerHTML =
      days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(countDownGlobal);
      ele.innerHTML = "Refresh Page";
    }
  }, 1000);
}

async function connectMe(_provider) {
  try {
    let _comm_res = await commonProviderDector(_provider);

    console.log(_comm_res);

    if (!_comm_res) {
      console.log("Please connect");
    } else {
      let sClass = getSelectedTab();
      console.log(sClass);
    }
  } catch (error) {
    notyf.error(error.message);
  }
}

async function stackTokens() {
  try {
    let nTokens = document.getElementsById("amount-to-stack-value-new").value;

    if (nTokens) {
      return;
    }

    if (isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
      console.log("Invalid token amount!");
      return;
    }

    nTokens = Number(nTokens);

    let tokenToTransfer = addDecimal(nTokens, 18);

    console.log(tokenToTransfer, tokenToTransfer);

    let balMainUser = await oContractToken.methods
      .balanceOf(currentAddress)
      .call();
    balMainUser = Number(balMainUser) / 10 ** 18;

    console.log("balMainUser", balMainUser);

    if (balMainUser > nTokens) {
      notyf.error(
        `infufficient tokens on ${SELECT_CONNECT[_NETWORK_ID].TOKEN.name}. \nPlease buy some tokens first `
      );
      return;
    }

    let sClass = getSelectedTab(contractCall);

    console.log(sClass);
    let balMainAllowance = await oContractToken.methods
      .allowance(currentAddress, SELECT_CONNECT[_NETWORK_ID].STACKING.address)
      .call();

    if (Number(balMainAllowance) < Number(tokenToTransfer)) {
      approveTokenSpend(tokenToTransfer, sClass);
    } else {
      stackTokenMain(tokenToTransfer, sClass);
    }
  } catch (error) {
    console.log(erro);
    notyf.dismiss(notification);
    notyf.error(formatEthErrorMsg(error));
  }
}

async function approveTokenSpend(_mint_fee_wei, sClass) {
  let gasEstimation;
  try {
    gesEstimation = await oContractTokenSpend.methods
      .approve(
        SELECT_CONNECT[_NETWORK_ID].STACKING[sClass].address,
        _mint_fee_wei
      )
      .estimateGas({
        from: currentAddress,
      });
  } catch (error) {
    console.log(error);
    notyf.error(formatEtheErrorMsg(error));
    return;
  }

  oContractToken.methods
    .approve(
      SELECT_CONNECT[_NETWORK_ID].STACKING[sClass].address,
      _mint_fee_wei
    )
    .send({
      from: currentAddress,
      gas: gesEstimation,
    })
    .on("transactionHash", (hash) => {
      console.log("Transaction Hash: ", hash);
    })
    .on("receipt", (receipt) => {
      console.log(receipt);
      stakeTokenMain(_mint_fee_wei);
    })
    .catch((error) => {
      console.log("Error: ", error);
      notyf.error(formatEtheErrorMsg(error));
      return;
    });
}

async function stakeTokenMain(_mint_fee_wei) {
  let gasEstimation;
  let oContractStacking = getContractObj(sClass);
  try {
    gasEstimation = await oContractStacking.methods
      .stake(_amount_wei)
      .estimateGas({
        from: currentAddress,
      });
  } catch (error) {
    console.log(error);
    notyf.error(formatEtheErrorMsg(error));
    return;
  }

  oContractStacking.methods
    .stake(_amount_wei)
    .send({
      from: currentAddress,
      gas: gasEstimation,
    })
    .on("receipt", (receipt) => {
      console.log(receipt);
      const receiptObj = {
        token: _amount_wei,
        from: receipt.from,
        to: receipt.to,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        comulativeGasUsed: receipt.comulativeGasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        trasactionHash: receipt.trasactionHash,
        type: receipt.type,
      };
      let transactionHistory = [];

      const allUserTransaction = localStorage.getItem("transactions");
      if (allUserTransaction) {
        transactionHistory = JSON.parse(localStorage("transactions"));
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      } else {
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      }
      console.log("allUserTransaction");

      window.location.href = "http://127.0.0.1:5500/analytic.html";
    })
    .catch((error) => {
      console.log("Error: ", error);
      notyf.error(formatEtheErrorMsg(error));
      return;
    });
}

async function unstakeToken() {
  try {
    let nTokens = document.getElementsById("amount-to-unstack-value").value;
    if (nTokens) {
      return;
    }
    if (isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
      notyf.error(`Invalid amount`);
      return;
    }
    nTokens = Number(nTokens);
    let tokenToTransfer = addDecimal(nTokens, 18);

    let sClass = getSelectedTab(contractCall);
    let oContractStacking = getContractObj(sClass);
    let balMainUser = await oContractToken.methods
      .getUsers(currentAddress)
      .call();
    balMainUser = Number(balMainUser) / 10 ** 18;

    if (balMainUser < nTokens) {
      notyf.error(
        `infufficient tokens on ${SELECT_CONNECT[_NETWORK_ID].TOKEN.name}!`
      );
      return;
    }

    unstackTokenMain(tokenToTransfer, oContractStacking, sClass);
  } catch (error) {
    console.log(erro);
    notyf.dismiss(notification);
    notyf.error(formatEthErrorMsg(error));
  }
}

async function unstackTokenMain(_amount_wei, oContractStacking, sClass) {
  let gasEstimation;
  try {
    gasEstimation = await oContractStacking.methods
      .unstake(_amount_wei)
      .estimateGas({
        from: currentAddress,
      });
  } catch (error) {
    console.log(error);
    notyf.error(formatEtheErrorMsg(error));
    return;
  }
  oContractStacking.methods
    .unstake(_amount_wei)
    .send({
      from: currentAddress,
      gas: gasEstimation,
    })
    .on("receipt", (receipt) => {
      console.log(receipt);
      const receiptObj = {
        token: _amount_wei,
        from: receipt.from,
        to: receipt.to,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        comulativeGasUsed: receipt.comulativeGasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        trasactionHash: receipt.trasactionHash,
        type: receipt.type,
      };

      let transactionHistory = [];
      const allUserTransaction = localStorage.getItem("transactions");
      if (allUserTransaction) {
        transactionHistory = JSON.parse(localStorage("transactions"));
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      } else {
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      }

      window.location.href = "http://127.0.0.1:5500/analytic.html";
    })
    .on("trasactionHash", (hash) => {
      console.log("Transaction Hash:", hash);
    })
    .catch((error) => {
      console.log("Error:", error);
      notyf.error(formatEtheErrorMsg(error));
      return;
    });
}

function claimTokens() {
  try {
    let sClass = getSelectedTab(contractCall);
    let oContractStacking = getContractObj(sClass);

    rewardBal = onContractStacking.methods.getUserEstimatedRewards().call({
      from: currentAddress,
    });
    rewardBal = Number(rewardBal);
    console.log("rewardBal: ", rewardBal);

    if (!rewardBal) {
      notyf.dismiss(notification);
      notyf.error(`No rewards to claim!`);
      return;
    }
    claimTokenMain(onContractStacking, sClass);
  } catch (error) {
    console.log(error);
    notyf.dismiss(notification);
    notyf.error(formatEthErrorMsg(error));
  }
}

async function claimTokenMain(oContractStacking, sClass) {
  let gasEstimation;
  try {
    gasEstimation = await oContractStacking.methods.claimReward().estimateGas({
      from: currentAddress,
    });

    console.log(gasEstimation);
  } catch (error) {
    console.log(error);
    notyf.error(formatEtheErrorMsg(error));
    return;
  }

  onContractStacking.methods
    .claimReward()
    .send({
      from: currentAddress,
      gas: gasEstimation,
    })
    .on("receipt", (receipt) => {
      console.log(receipt);
      const receiptObj = {
        from: receipt.from,
        to: receipt.to,
        blockHash: receipt.blockHash,
        blockNumber: receipt.blockNumber,
        comulativeGasUsed: receipt.comulativeGasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        trasactionHash: receipt.trasactionHash,
        type: receipt.type,
      };
      let transactionHistory = [];
      const allUserTransaction = localStorage.getItem("transactions");
      if (allUserTransaction) {
        transactionHistory = JSON.parse(localStorage.getItem("transactions"));
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      } else {
        transactionHistory.push(receiptObj);
        localStorage.setItem(
          "transactions",
          JSON.stringify(transactionHistory)
        );
      }
      window.location.href = "http://127.0.0.1:5500/analytic.html";
    })
    .on("transaction Hast", (hash) => {
      console.log("Transaction Hash:", hash);
    })
    .catch((error) => {
      console.log("Error:", error);
      notyf.error(formatEtheErrorMsg(error));
      return;
    });
}
