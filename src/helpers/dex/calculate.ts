export function setTransactionMessage(data, cashback, transactions) {
    if (data.paths.length > 0) {

        let array = []

        for (let tx of transactions) {
            array.push({
                address: tx.address,
                amount: tx.value,
                payload: tx.cell
            })
        }

        if (cashback === true) {
            let message = {
                address: 'EQCuEGnEPtnz728HCWb36rM1LLArmxLVAB3-aeojNRDDk7Tw',
                amount: '125000000'
            }
            array.push(message)
        }
        return array
    }
}

export function getDexSourceDataByName(name) {
    switch (name) {
        case "dedust":
            return {
                name: "DeDust",
                imageUrl: "https://dedust.io/favicon-32x32.png",
            }
        case "stonfi":
            return {
                name: "STONfi",
                imageUrl: "https://static.ston.fi/favicon/favicon.ico",
            }
    }
    throw new Error("Unknown DEX source name")
}

export async function waitForOutboundTx(userWallet) {
    let eventSource = new EventSource(`https://tonapi.io/v2/sse/accounts/transactions?accounts=${userWallet}`);

    return new Promise((resolve, reject) => {
        eventSource.onmessage = async function (event) {
            let data = JSON.parse(event.data)
            eventSource.close()

            resolve(data.tx_hash)
        };

        eventSource.onerror = function (event) {
            reject(event);
            eventSource.close();
        }
    });
}
