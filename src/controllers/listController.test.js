// Les variables d'environnement sont chargés via --require test.config.js (dans la commande npm run test)
// La base de données et le serveurs sont lancés via --require test.hooks.js
// La BDD de test est vidé entre chaque test !

import { describe, it } from "mocha";
import { expect } from "chai";
import { List } from "../models/index.js";

const apiBaseUrl = `http://localhost:${process.env.PORT}/api`;

describe("Lists endpoints", () => {

  describe("[GET] /lists", () => {
    it("should return an empty array when the list table is empty", async () => {
      const httpResponse = await fetch(`${apiBaseUrl}/lists`);
      const lists = await httpResponse.json();

      expect(lists.length).to.equal(0);
    });

    it("should return a status 200", async () => {
      const httpResponse = await fetch(`${apiBaseUrl}/lists`);
      
      expect(httpResponse.status).to.equal(200);
    });

    it("should return all lists from the database", async () => {
      await List.create({ title: "Hello world" });

      const httpResponse = await fetch(`${apiBaseUrl}/lists`);
      const lists = await httpResponse.json();

      expect(lists[0].title).to.equal("Hello world");
    });
  });

  describe("[GET] /lists/:id", () => {
    it("should return the requested list by its id", async () => {
      const existingList = await List.create({ title: "Hello world" });

      const httpResponse = await fetch(`${apiBaseUrl}/lists/${existingList.id}`);
      const list = await httpResponse.json(); // { ... }

      expect(list).to.deep.equal(JSON.parse(JSON.stringify(existingList)));
    });
  });

  describe("[POST] /lists", () => {
    it("should create a list in database", async () => {
      const newList = {
        title: "Liste de test",
        position: 4
      };
  
      const httpResponse = await fetch(`${apiBaseUrl}/lists`, {
        method: "POST",
        body: JSON.stringify(newList),
        headers: { "Content-Type": "application/json" }
      });
      const returnedList = await httpResponse.json();

      const insertedList = await List.findOne({ where: { title: "Liste de test" } });
      expect(insertedList.id).to.equal(returnedList.id);
    });

    it("should reject the request with a 400 if the user tries to create a list without title", async () => {
      const httpResponse = await fetch(`${apiBaseUrl}/lists`, {
        method: "POST",
        body: JSON.stringify({ position: 3 }), // Ici, on créé une liste sans préciser le TITLE
        headers: { "Content-Type": "application/json" }
      });

      expect(httpResponse.status).to.equal(400);
      const { error } = await httpResponse.json();
      expect(error).to.equal("Missing body parameter or invalid format: 'title'.");
    });

    it("should reject requests with XSS injection attempts", async () => {
      const BODY = { title: `<img src="imageInconnue.png" onerror="window.location='http://oclock.io'">` };

      const httpResponse = await fetch(`${apiBaseUrl}/lists`, {
        method: "POST",
        body: JSON.stringify(BODY),
        headers: { "Content-Type": "application/json" }
      });

      expect(httpResponse.status).to.equal(400);
      const { error } = await httpResponse.json();
      expect(error).to.equal("Missing body parameter or invalid format: 'title'.");
    });
  });
});
