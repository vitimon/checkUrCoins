const fetch = require("node-fetch")

const coinsAPI = 'https://nodes.wavesexplorer.com/assets/balance/'
const assetAPI = 'https://waves.guarda.co/assets/details/'
const ordersAPI = `https://matcher.waves.exchange/matcher/orderbook/`
const matcherFee = 0.003

//função para coleta de dados nas apis
async function getData(address){
    let response = await fetch(address);

    if (response.ok) {
        let json = response.json();
        return json
    }else {
        console.log("Error at getData func - DEURUIM"); //ainda tentando descobrir em que parte causa erro quando a coleta de dados é grande
}

}

//endereços para testes
const testAddress = '3PH2vS8qzdGf66hDskiRMk3vrUuZBUzpSau'
const nodeBR ='3P1xU8QSBk2gDQkepGYu24tTfwj4FgS7avv'
const wavesnode = '3P23fi1qfVw6RVDn4CH2a5nNouEtWNQ4THs'

//função checagem das moedas - aparentemente não consegue tratar uma carteira com muitas moedas
let checkCoins = async function(wallet){
        let dumpfolio = []
        let getCoins = await getData(coinsAPI + wallet)
        getCoins = getCoins.balances
        for(var i in getCoins){
            let coinId = getCoins[i].assetId
            let coinInfo = await getData(assetAPI + coinId)
            let coinName = coinInfo.name
            let decimals = coinInfo.decimals
            let currentBalance = getCoins[i].balance/(10**decimals)
            let sponsored = (getCoins[i].minSponsoredAssetFee  ? "SPONSORED"  : "UNSPONSORED")
            let orderbook = await getData(`https://matcher.waves.exchange/matcher/orderbook/${coinId}/WAVES`)
            let price = (orderbook.bids[0] ? orderbook.bids[0].price*(10**(decimals -16)) : 0)// esse método ainda pode ser enganoso caso "orderbook.bids[0].amount < currentBalance" correção a ser implementada
            let minWorthSell = matcherFee/price
            //let line = `Name: ${coinName} | sponsored? ${sponsored} | minimum value worth selling: ${minWorthSell} | Your Balance: ${currentBalance} ${(currentBalance > minWorthSell ? "SELL" : "HODL")}\n`
            //console.log(line)
            if(currentBalance > minWorthSell){console.log(`${coinName} is SELLABLE for ${currentBalance*price -matcherFee}`)}
            //if(sponsored == "SPONSORED"){console.log(`${coinName} is SPONSORED`)}
            //dubugging ainda
        }

        return(dumpfolio)
    } 

checkCoins(wavesnode)
