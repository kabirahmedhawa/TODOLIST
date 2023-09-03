const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require('lodash')
const date = require(__dirname + "/date.js");

mongoose.connect("mongodb+srv://kabirhawa:Test%40123@cluster0.t6dx2lu.mongodb.net/todolist", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: "admin", // Or the appropriate authentication database
});

const itemsSchema = mongoose.Schema({
  name: { type: String, required: true },
});

const ListSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const Item = mongoose.model("item", itemsSchema);

const List = mongoose.model("list", ListSchema);

console.log(date);
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//call our date modules
const day = date.getDate();
const weekday = date.getDay();

app.use(express.static("public"));
let items = [];
let workItem = [];
let arr = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

app.get("/", function (req, res) {
  Item.find()
    .then((data) => {
      res.render("list", {
        work_Title: "Today is! " + day,
        list_items: data,
        route: "",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/", function (req, res) {

  let item = req.body.list_item;
  let type = req.body.list;
  const newItem = new Item({
    name: item,
  });
  newItem
    .save()
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
  if (type === "Work") {
    workItem.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.post("/delete", function (req, res) {
  console.log(req.body);
  const name = req.body.listname;
  if (name) {
    console.log(req.body);
    
    List.findOneAndUpdate(
      { name: name },
      { $pull: { items: { _id: req.body.checkbox } } }
    )
      .then((data) => {
        console.log(data);
        res.redirect(`/${name}`);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    Item.findByIdAndRemove(req.body.checkbox)
      .then((data) => {
        console.log(data);
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.get("/:customlist", function (req, res) {
  const customlistName = _.capitalize(req.params.customlist);
  List.find({ name: customlistName }).then((data) => {
    console.log(data);
    res.render("list", {
      work_Title: `${customlistName} List`,
      list_items: data[0]?.items,
      route: customlistName,
    });
  });
});

app.post("/:customlist", function (req, res) {
  const customlistName = req.params.customlist;
  let item = req.body.list_item;
  const newItem = new Item({
    name: item,
  });

  List.findOneAndUpdate(
    { name: customlistName },
    { $push: { items: newItem } }, // Push the newItem to the items array
    { upsert: true }
  )
    .then((data) => {
      console.log(data);
      res.redirect(`/${customlistName}`);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("listening on port 3000...");
});
