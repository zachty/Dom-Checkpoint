/* eslint-disable no-alert */

/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
    const counter = document.querySelector('#coffee_counter');
    counter.innerText = coffeeQty;
}

function clickCoffee(data) {
    updateCoffeeView(++data.coffee);
    renderProducers(data);
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
    for (let i = 0; i < producers.length; i++) {
        if (coffeeCount >= producers[i].price / 2) producers[i].unlocked = true;
    }
}

function getUnlockedProducers(data) {
    //rewrite this using filter method??
    //should maybe call unlock producers here
    const unlockedProducerArray = [];
    for (const producer of data.producers) {
        if (producer.unlocked) unlockedProducerArray.push(producer);
    }
    return unlockedProducerArray;
}

function makeDisplayNameFromId(id) {
    return id
        .split('_')
        .map(ele => ele[0].toUpperCase() + ele.slice(1))
        .join(' ');
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer) {
    const containerDiv = document.createElement('div');
    containerDiv.className = 'producer';
    const displayName = makeDisplayNameFromId(producer.id);
    const currentCost = producer.price;
    const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <button type="button" id="buy_${producer.id}">Buy</button>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} covfefe</div>
  </div>
  `;
    containerDiv.innerHTML = html;
    return containerDiv;
}

function deleteAllChildNodes(parent) {
    //gotta be a better way to do this, doesnt work with just one loop
    //probably because deleting the chilren while iterating confuses the loop
    const children = [];
    for (const child of parent.childNodes) {
        children.push(child);
    }
    for (const child of children) {
        parent.removeChild(child);
    }
    //example from mdn, looks much cleaner
    /*let element = document.getElementById("top");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }*/
}

function renderProducers(data) {
    //data is an object with # of coffee and array of producers
    // deleteAllChildNodes - can delete all the producer divs
    //unlockProducers - allows corect producers to be got
    //getUnlockedProducers - array of unlocked producers
    //makeProducerDiv - create child node
    const producerContainer = document.getElementById('producer_container');
    deleteAllChildNodes(producerContainer);

    unlockProducers(data.producers, data.coffee);
    const producers = getUnlockedProducers(data);

    for (const producer of producers) {
        let div = makeProducerDiv(producer);
        producerContainer.appendChild(div);
    }
}

/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
    for (const producer of data.producers) {
        if (producer.id === producerId) return producer;
    }
}

function canAffordProducer(data, producerId) {
    const producer = getProducerById(data, producerId);
    if (data.coffee > producer.price) return true;
    else return false;
}

function updateCPSView(cps) {
    const cpsNum = document.getElementById('cps');
    cpsNum.innerText = cps;
}

function updatePrice(oldPrice) {
    return Math.floor(oldPrice * 1.25);
}

function attemptToBuyProducer(data, producerId) {
    const producer = getProducerById(data, producerId);
    //could use canAffordProducer, but I already have producer here ^
    if (data.coffee >= producer.price) {
        producer.qty++;
        data.coffee -= producer.price;
        producer.price = updatePrice(producer.price);
        data.totalCPS += producer.cps;
        return true;
    } else return false;
}

function buyButtonClick(event, data) {
    // event.stopPropagation(); undefined in test specs
    if (event.target.tagName === 'BUTTON') {
        // const purchased = attemptToBuyProducer(data, event.target.id.slice(4));
        if (attemptToBuyProducer(data, event.target.id.slice(4))) {
            renderProducers(data);
            updateCoffeeView(data.coffee);
            updateCPSView(data.totalCPS);
        } else window.alert('Not enough coffee!');
    }
}

function tick(data) {
    updateCoffeeView((data.coffee += data.totalCPS));
    renderProducers(data);
}

/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === 'undefined') {
    // Get starting data from the window object
    // (This comes from data.js)
    const data = window.data;

    // Add an event listener to the giant coffee emoji
    const bigCoffee = document.getElementById('big_coffee');
    bigCoffee.addEventListener('click', () => clickCoffee(data));

    // Add an event listener to the container that holds all of the producers
    // Pass in the browser event and our data object to the event listener
    const producerContainer = document.getElementById('producer_container');
    producerContainer.addEventListener('click', event => {
        buyButtonClick(event, data);
    });

    //load game if it was saved
    if (localStorage.length) {
        console.log('loaded!');
        data.coffee = Number(localStorage.getItem('coffee'));
        updateCPSView((data.totalCPS = Number(localStorage.getItem('cps'))));
        data.producers = JSON.parse(localStorage.getItem('producers'));
    }

    // Call the tick function passing in the data object once per second
    setInterval(() => tick(data), 1000);

    //save the game
    setInterval(() => {
        localStorage.setItem('coffee', data.coffee);
        localStorage.setItem('cps', data.totalCPS);
        localStorage.setItem('producers', JSON.stringify(data.producers));
    }, 5000); //set local storage every 5 seconds
}
// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
    module.exports = {
        updateCoffeeView,
        clickCoffee,
        unlockProducers,
        getUnlockedProducers,
        makeDisplayNameFromId,
        makeProducerDiv,
        deleteAllChildNodes,
        renderProducers,
        updateCPSView,
        getProducerById,
        canAffordProducer,
        updatePrice,
        attemptToBuyProducer,
        buyButtonClick,
        tick,
    };
}
