/**
 * Copyright 2021-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Messenger For Original Coast Clothing
 * https://developers.facebook.com/docs/messenger-platform/getting-started/sample-apps/original-coast-clothing
 */

"use strict";

const Bot = require("./bot"),
  Response = require("./response"),
  i18n = require("../i18n.config"),
  GraphApi = require("./graph-api");

module.exports = class Receive {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
  }

  // Check if the event is a message or postback and
  // call the appropriate handler function
  handleMessage() {
    let event = this.webhookEvent;
    let responses;

    try {
      if (event.message) {
        let message = event.message;

        if (message.quick_reply) {
          responses = this.handleQuickReply();
        } else if (message.attachments) {
          responses = this.handleAttachmentMessage();
        } else if (message.text) {
          responses = this.handleTextMessage();
        }
      } else if (event.postback) {
        responses = this.handlePostback();
      } else if (event.referral) {
        responses = this.handleReferral();
      }
    } catch (error) {
      console.error(error);
      responses = {
        text: `An error has occured: '${error}'. We have been notified and \
        will fix the issue shortly!`
      };
    }

    if (Array.isArray(responses)) {
      let delay = 0;
      for (let response of responses) {
        this.sendMessage(response, delay * 2000);
        delay++;
      }
    } else {
      this.sendMessage(responses);
    }

  }

  // Handles messages events with text
  handleTextMessage() {
    console.log(
      "Received text:",
      `${this.webhookEvent.message.text} for ${this.user.psid}`
    );

    let event = this.webhookEvent;

    // check greeting is here and is confident
    let greeting = this.firstEntity(event.message.nlp, "intro");
    let message = event.message.text.trim().toLowerCase();
    let response;

    if (
      (greeting && greeting.confidence > 0.8) ||
      message.includes("empezar")
    ) {
      response = Response.genNuxMessage(this.user, true);
    } else {
      response = [
        Response.genText(
          i18n.__("error.message", {
            message: event.message.text
          })
        ),
        Response.genText(i18n.__("bot.guia")),
        Response.genQuickReply(i18n.__("bot.ayuda"), [
          {
            title: i18n.__("menu.soporte"),
            payload: "SOPORTE"
          },
          {
            title: i18n.__("menu.atencion"),
            payload: "ATENCION"
          },
          {
            title: i18n.__("menu.informacion"),
            payload: "INFORMACION"
          },
          {
            title: i18n.__("menu.lineaAtencion"),
            payload: "LINEA_ATENCION"
          },
          {
            title: i18n.__("menu.agente"),
            payload: "AGENTE"
          },
          {
            title: i18n.__("menu.finalizarChat"),
            payload: "FINALIZAR_CHAT"
          }
        ])
      ];
    }

    return response;
  }

  // Handles mesage events with attachments
  handleAttachmentMessage() {
    let response;

    // Get the attachment
    let attachment = this.webhookEvent.message.attachments[0];
    console.log("Received attachment:", `${attachment} for ${this.user.psid}`);

    response = Response.genQuickReply(i18n.__("archivo.adjunto"), [
      {
        title: i18n.__("menu.agente"),
        payload: "AGENTE"
      }
    ]);

    return response;
  }

  // Handles mesage events with quick replies
  handleQuickReply() {
    // Get the payload of the quick reply
    let payload = this.webhookEvent.message.quick_reply.payload;

    //console.log(payload, "handleQuickReply");

    return this.handlePayload(payload);
  }

  // Handles postbacks events
  handlePostback() {
    let postback = this.webhookEvent.postback;
    // Check for the special Get Starded with referral
    let payload;
    if (postback.payload) {
      // Get the payload of the postback
      payload = postback.payload;
    } else if (postback.referral && postback.referral.type == "OPEN_THREAD") {
      payload = postback.referral.ref;
    }

    //console.log(payload, "handlePostback");

    return this.handlePayload(payload.toUpperCase());
  }

  // Handles referral events
  handleReferral() {
    // Get the payload of the postback
    let payload = this.webhookEvent.referral.ref.toUpperCase();
    //console.log(payload, "handleReferral");
    return this.handlePayload(payload);
  }

  handlePayload(payload) {
    console.log("Received Payload:", `${payload} for ${this.user.psid}`);

    let response;

    // Set the response based on the payload
    if (payload === "MENU_PRINCIPAL") {

      response = Response.genNuxMessage(this.user, false);

    } else if (payload.includes("SOPORTE") || payload.includes("ATENCION") ||
      payload.includes("INFORMACION") || payload.includes("LINEA_ATENCION") ||
      payload.includes("AGENTE") || payload.includes("FINALIZAR_CHAT")) {

      response = Bot.handlePayload(payload);

    } else {
      response = {
        text: `This is a default postback message for payload: ${payload}!`
      };
    }

    return response;
  }

  handlePrivateReply(type, object_id) {
    let welcomeMessage =
      i18n.__("bot.intro") +
      " " +
      i18n.__("bot.guia") +
      ". " +
      i18n.__("bot.ayuda");

    let response = Response.genQuickReply(welcomeMessage, [
      {
        title: i18n.__("menu.principal"),
        payload: "MENU_PRINCIPAL"
      }
    ]);

    let requestBody = {
      recipient: {
        [type]: object_id
      },
      message: response
    };

    GraphApi.callSendApi(requestBody);
  }

  sendMessage(response, delay = 0) {
    // Check if there is delay in the response
    if ("delay" in response) {
      delay = response["delay"];
      delete response["delay"];
    }

    // Construct the message body
    let requestBody = {
      recipient: {
        id: this.user.psid
      },
      message: response
    };

    // Check if there is persona id in the response
    if ("persona_id" in response) {
      let persona_id = response["persona_id"];
      delete response["persona_id"];

      requestBody = {
        recipient: {
          id: this.user.psid
        },
        message: response,
        persona_id: persona_id
      };
    }

    setTimeout(() => GraphApi.callSendApi(requestBody), delay);
  }

  firstEntity(nlp, name) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
  }
};
