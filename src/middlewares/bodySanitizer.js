import sanitizeHtml from "sanitize-html";

export const bodySanitizer = (req, res, next) => {
  // Pour chaque CHAMPS de req.body qui soit un champs `string`, on filtre à travers sanitizeHTML
  Object.keys(req.body).forEach(key => { // req.body = { title: "...", position: "..." } ==> ["title", "position"]
    if (typeof req.body[key] === "string") {
      req.body[key] = sanitizeHtml(req.body[key]);
    }
  });
  next();
};
