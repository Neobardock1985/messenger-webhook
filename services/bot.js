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

// Imports dependencies
const Response = require("./response"),
  i18n = require("../i18n.config");

module.exports = class Bot {
  static handlePayload(payload) {
    let response;

    switch (payload) {
      case "SOPORTE":
        response = Response.genQuickReply(i18n.__("respuestas.soporte"), [
          {
            title: i18n.__("respuestas.nuevaConsulta"),
            payload: "NUEVA_CONSULTA"
          }
        ]);
        break;

      case "ATENCION":
        response = Response.genQuickReply(i18n.__("respuestas.atencion"), [
          {
            title: i18n.__("respuestas.nuevaConsulta"),
            payload: "NUEVA_CONSULTA"
          }
        ]);
        break;

      case "INFORMACION":
        response = Response.genQuickReply(i18n.__("respuestas.informacion"), [
          {
            title: i18n.__("respuestas.nuevaConsulta"),
            payload: "NUEVA_CONSULTA"
          }
        ]);
        break;

      case "MENU_PRINCIPAL":
        response = Response.genQuickReply(i18n.__("menu.menuPrincipal"), [
          {
            title: i18n.__("respuestas.nuevaConsulta"),
            payload: "NUEVA_CONSULTA"
          }
        ]);
        break;

      case "LINEA_ATENCION":
        response = Response.genQuickReply(i18n.__("respuestas.lineaAtencion"), [
          {
            title: i18n.__("respuestas.nuevaConsulta"),
            payload: "NUEVA_CONSULTA"
          }
        ]);
        break;

      case "FINALIZAR_CHAT":
        response = Response.genQuickReply(i18n.__("respuestas.finalizarChat"), [
          {
            title: i18n.__("respuestas.nuevaConsulta"),
            payload: "NUEVA_CONSULTA"
          }
        ]);
        break;


    }

    return response;
  }
};
