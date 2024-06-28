import { describe, it } from "mocha";
import { expect } from "chai";
import { Tag } from "../models/index.js";

const apiBaseUrl = `http://localhost:${process.env.PORT}/api`;

describe("[GET] /tags", () => {
  it("should return all tags", async () => {
    const tag0 = await Tag.create({ name: "tag0" });
    const tag1 = await Tag.create({ name: "tag1" });

    const tags = await get(`${apiBaseUrl}/tags`);

    expect(tags[0]).to.deep.equal(json(tag0));
    expect(tags[1]).to.deep.equal(json(tag1));
  });
});

describe("[GET] /tags/1", () => {
  it("should return one tag", async () => {
    const tag = await Tag.create({ name: "tag" });

    const foundTag = await get(`${apiBaseUrl}/tags/${tag.id}`);

    expect(foundTag).to.deep.equal(json(tag));
  });
});

describe("[POST] /tags", () => {
  it("should create one tag", async () => {
    const TAG_TO_CREATE = { name: "tag" };

    const createdTag = await post(`${apiBaseUrl}/tags`, TAG_TO_CREATE);

    const foundTag = await Tag.findByPk(createdTag.id);
    expect(createdTag).to.deep.equal(json(foundTag));
    expect(createdTag).to.deep.include(TAG_TO_CREATE);
  });
});

async function get(url) {
  const httpResponse = await fetch(url);
  return await httpResponse.json();
}

async function post(url, body) {
  const httpResponse = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });
  return await httpResponse.json();
}

function json(modelInstance) {
  return JSON.parse(JSON.stringify(modelInstance.toJSON()));
}
