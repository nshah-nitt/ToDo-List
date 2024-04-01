import express from "express";
import bodyParser from "body-parser";
import pg from 'pg'
import notifier from 'node-notifier'

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "naman",
  port: 5432
})
db.connect();
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", async (req, res) => {
  let item = []
  try{
    const items = await db.query("SELECT * FROM items")
    item = items.rows
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: item,
    });
  }catch(err){
    console.log(err)
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  if(item){
    try{
      await db.query("INSERT INTO items (title) VALUES ($1)",[item])
      res.redirect("/");
    }catch(err){
      console.log(err)
    }
  }else{
    notifier.notify({
      title:'Alert',
      message:'Value cannot be empty',
      sound: 'true'
    })
  }
});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId
  const title = req.body.updatedItemTitle
  try{
    await db.query("UPDATE items SET title = ($1) WHERE id = ($2)",[title,id])
    res.redirect("/")
  }catch(err){
    console.log(err)
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId
  try{
    await db.query("DELETE FROM items where id = ($1)",[id])
    res.redirect("/")
  }catch(err){
    console.log(err)
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
