/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { SharedMap } from "fluid-framework";
import { AzureClient, LOCAL_MODE_TENANT_ID } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils"
import * as AdaptiveCards from "adaptivecards";
import * as ACData from "adaptivecards-templating";

// The config is set to run against a local service by default. Run `npx tinylicious` to run locally
// Update the corresponding properties below with your tenant specific information to run against your tenant.
const serviceConfig = {
    connection: {
        tenantId: "50aee7e3-e956-434c-a628-802fb279c65f", // REPLACE WITH YOUR TENANT ID
        tokenProvider: new InsecureTokenProvider("891a5a241de1e948ecf43830e6a32ea3" /* REPLACE WITH YOUR PRIMARY KEY */, { id: "userId" }),
        orderer: "https://alfred.southeastasia.fluidrelay.azure.com", // REPLACE WITH YOUR ORDERER ENDPOINT
        storage: "https://historian.southeastasia.fluidrelay.azure.com", // REPLACE WITH YOUR STORAGE ENDPOINT
    }
};

const client = new AzureClient(serviceConfig);

const cardDataKey = "card-data-key";

const cardJson = {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.5",
    "speak": "<s>The forecast for Seattle November 5 is mostly clear with a High of 50 degrees and Low of 41 degrees</s>",
    "body": [
        {
            "type": "TextBlock",
            "text": "${city}",
            "size": "Large",
            "isSubtle": true,
            "wrap": true
        },
        {
            "type": "TextBlock",
            "text": "{{DATE(2019-11-05T02:21:18+00:00, SHORT)}} {{TIME(2019-11-05T02:21:18+00:00)}}",
            "spacing": "None",
            "wrap": true
        },
        {
            "type": "ColumnSet",
            "columns": [
                {
                    "type": "Column",
                    "width": "auto",
                    "items": [
                        {
                            "type": "Image",
                            "url": "https://messagecardplayground.azurewebsites.net/assets/Mostly%20Cloudy-Square.png",
                            "size": "Small"
                        }
                    ]
                },
                {
                    "type": "Column",
                    "width": "auto",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "46",
                            "size": "ExtraLarge",
                            "spacing": "None",
                            "wrap": true
                        }
                    ]
                },
                {
                    "type": "Column",
                    "width": "stretch",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "°F",
                            "weight": "Bolder",
                            "spacing": "Small",
                            "wrap": true
                        }
                    ]
                },
                {
                    "type": "Column",
                    "width": "stretch",
                    "items": [
                        {
                            "type": "TextBlock",
                            "text": "Hi 50",
                            "horizontalAlignment": "Left",
                            "wrap": true
                        },
                        {
                            "type": "TextBlock",
                            "text": "Lo 41",
                            "horizontalAlignment": "Left",
                            "spacing": "None",
                            "wrap": true
                        }
                    ]
                }
            ]
        }
    ]
};

const cardData = {
    "city": "Hyderabad, Telangana"
}

const containerSchema = {
    initialObjects: { cardDataMap: SharedMap }
};
const root = document.getElementById("content");

const createNewCard = async () => {
    const { container } = await client.createContainer(containerSchema);
    container.initialObjects.cardDataMap.set(cardDataKey, cardData);
    const id = await container.attach();
    renderCardWithFluid(container.initialObjects.cardDataMap, root);
    return id;
}

const loadExistingCard = async (id) => {
    const { container } = await client.getContainer(id, containerSchema);
    renderCardWithFluid(container.initialObjects.cardDataMap, root);
}

async function start() {
    if (location.hash) {
        await loadExistingCard(location.hash.substring(1))
    } else {
        const id = await createNewCard();
        location.hash = id;
    }
}

start().catch((error) => console.error(error));

// Define the view

const template = document.createElement("template");

template.innerHTML = `
  <style>
    .wrapper { text-align: center }
    .update { font-size: 30px;}
    .log { font-size: 20px; padding-top: 50px}
  </style>
  <div class="wrapper">
    <textarea class="data-input" rows="4" cols="50"></textarea> <br/><br/><br/>
    <button class="update"> Update </button>
    <div class="card"></card>
    <div class="log"></div>
  </div>
`

const renderCard = (acTemplate, acData, div) => {
    // Create a Template instance from the template payload
    var template = new ACData.Template(acTemplate);

    // Create a data binding context, and set its $root property to the
    // data object to bind the template to
    var context = {
        $root: acData
    };

    // "Expand" the template - this generates the final Adaptive Card,
    // ready to render
    var card = template.expand(context);


    var adaptiveCard = new AdaptiveCards.AdaptiveCard();

    // Set its hostConfig property unless you want to use the default Host Config
    // Host Config defines the style and behavior of a card
    adaptiveCard.hostConfig = new AdaptiveCards.HostConfig({
        fontFamily: "Segoe UI, Helvetica Neue, sans-serif"
        // More host config options
    });

    // Set the adaptive card's event handlers. onExecuteAction is invoked
    // whenever an action is clicked in the card
    adaptiveCard.onExecuteAction = function(action) { alert("Ow!"); }

    // Parse the card payload
    adaptiveCard.parse(card);

    // Render the card to an HTML element:
    var renderedCard = adaptiveCard.render();

    // And finally insert it somewhere in your page:
    div.textContent = '';
    div.appendChild(renderedCard);
}

const renderCardWithFluid = (cardData, elem) => {
    elem.appendChild(template.content.cloneNode(true));

    const dice = elem.querySelector(".dice");
    const card = elem.querySelector(".card");
    const updateButton = elem.querySelector(".update");
    const datatextarea = elem.querySelector(".data-input");
    const log = elem.querySelector(".log");

    updateButton.onclick = () => {
        const cardDataObject = JSON.parse(datatextarea.value);
        cardData.set(cardDataKey, cardDataObject);
    }

    // Get the current value of the shared data to update the view whenever it changes.
    const updateCard = () => {
        const cardDataValue = cardData.get(cardDataKey);
        console.log(cardDataValue);
        renderCard(cardJson, cardDataValue, card);
    };
    updateCard();

    // Use the changed event to trigger the rerender whenever the value changes.
    cardData.on("valueChanged", updateCard);

}
