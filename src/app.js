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
            "text": "Mumbai123",
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



const containerSchema = {
    initialObjects: { cardDataMap: SharedMap }
};


async function start() {
    const { container } = await client.getContainer("42a4e660-c3ac-499f-89e6-bcc1fe97a416", containerSchema);
    const cardDataNew = {
        "card": cardJson,
        "version": Date.now()
    }
    const data = container.initialObjects.cardDataMap.get(cardDataKey);
    console.log(data);
    //container.initialObjects.cardDataMap.set(cardDataKey, cardDataNew);
}
start().catch((error) => console.error(error));