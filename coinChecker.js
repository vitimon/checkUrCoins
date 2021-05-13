const fetch = require("node-fetch")

const coinsAPI = 'https://nodes.wavesexplorer.com/assets/balance/'
const assetAPI = 'https://waves.guarda.co/assets/details/'
const ordersAPI = `https://matcher.waves.exchange/matcher/orderbook/`
const matcherFee = 0.003

//função para coleta de dados nas apis
async function getData(address){
    let response = await fetch(address)

    if (response.ok) {
        let json = response.json()
        return json
    }else {
        console.log("Error at getData func - DEURUIM") //ainda tentando descobrir em que parte causa erro quando a coleta de dados é grande
}

}
//função que verifica orderbook
function checkBids(bids,decimals,result,index=0){
    if(!bids[index]){
        result.profit -= matcherFee
        return(result)
    }
    let normAmount = bids[index].amount/10**decimals
    let normPrice = bids[index].price/10**(16-decimals)
    let bidRatio = result.finalBalance/normAmount
    if(bidRatio < 1.0){        
        result.endPrice = normPrice
        result.profit += (result.endPrice*result.finalBalance - matcherFee)
        result.finalBalance = 0
        return(result)        
    }else{
        result.endPrice = normPrice
        result.profit += result.endPrice*normAmount
        result.finalBalance -= normAmount
        index += 1
        return(checkBids(bids,decimals,result,index))
    }
    
}

//endereços para testes
const testAddress = '3PH2vS8qzdGf66hDskiRMk3vrUuZBUzpSau'    //meu endereço
const nodeBR ='3P1xU8QSBk2gDQkepGYu24tTfwj4FgS7avv'          //Node brasileiro do time Waves - faz um lease lá!
const wavesnode = '3P23fi1qfVw6RVDn4CH2a5nNouEtWNQ4THs'      //node gringo com uma quntidade massiva de moedas que ainda não consiguimos tratar

//função checagem das moedas - aparentemente não consegue tratar uma carteira com muitas moedas
async function checkCoins(wallet){
        let dumpfolio = []
        let getCoins = await getData(coinsAPI + wallet)
        getCoins = getCoins.balances
        for(var i in getCoins){
            let coinId = getCoins[i].assetId
            let coinInfo = await getData(assetAPI + coinId)
            let coinName = coinInfo.name
            //console.log(`TOKEN: ${coinName}`)
            let decimals = coinInfo.decimals
            let currentBalance = getCoins[i].balance/(10**decimals)
            let sponsored = (getCoins[i].minSponsoredAssetFee  ? "SPONSORED"  : "UNSPONSORED")
            let orderbook = await getData(`https://matcher.waves.exchange/matcher/orderbook/${coinId}/WAVES`)
            let afterSell = checkBids(orderbook.bids,decimals, {"finalBalance": currentBalance, "endPrice":0, "profit": 0})
            //bloco de logs
            
            //let line = `Name: ${coinName} | sponsored? ${sponsored} | minimum value worth selling: ${minWorthSell} | Your Balance: ${currentBalance} ${(currentBalance > minWorthSell ? "SELL" : "HODL")}\n`
            //console.log(line)
            if(afterSell.profit > 0){console.log(`${coinName} is SELLABLE for ${afterSell.profit} of profit`)}
            //if(sponsored == "SPONSORED"){console.log(`${coinName} is SPONSORED`)}
            //debugging ainda
        }

        return(dumpfolio)
    } 


//testagem da função
checkCoins(nodeBR)
