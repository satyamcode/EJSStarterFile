//jshint esversion:6


const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");
const _=require("lodash");
mongoose.set('strictQuery', false);
const date=require(__dirname+"/date.js");


const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
// mongodb://20bec098-satyam:<password>@ac-1dcq9ea-shard-00-00.emagjjc.mongodb.net:27017,ac-1dcq9ea-shard-00-01.emagjjc.mongodb.net:27017,ac-1dcq9ea-shard-00-02.emagjjc.mongodb.net:27017/?ssl=true&replicaSet=atlas-k1o805-shard-0&authSource=admin&retryWrites=true&w=majority
mongoose.connect("mongodb://20bec098-satyam:Satyam1234@ac-1dcq9ea-shard-00-00.emagjjc.mongodb.net:27017,ac-1dcq9ea-shard-00-01.emagjjc.mongodb.net:27017,ac-1dcq9ea-shard-00-02.emagjjc.mongodb.net:27017/?ssl=true&replicaSet=atlas-k1o805-shard-0&authSource=admin&retryWrites=true&w=majority",{

  useUnifiedTopology: true,

  useNewUrlParser: true});
  const itemsSchema=new mongoose.Schema({
    work:String
  });
  const Item=mongoose.model("Item",itemsSchema);
  const a=new Item({
    work: "cooking"
  })
  const b=new Item({
    work: "sleeping"
  })
  const c=new Item({
    work: "running"
  })
  const defaultItems=[a,b,c];
  const listSchema={
    name:String,
    items:[itemsSchema]
  }
  const List=mongoose.model("List",listSchema);



app.get("/", function(req, res){
  Item.find({},function(err,founditems){
    if(founditems.length===0){
      Item.insertMany(defaultItems,function(err){
      if (err) {
              throw new Error(err);
           }
           else{
             console.log("succesfully saved");
           }
        })
    }
    let day=date.getDate();
    res.render("list",{kindofday: day,newslistitems:founditems})

  });
});
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list=new List({
          name:customListName,
          items:defaultItems
        });

        list.save();
        res.redirect("/"+customListName)
      }
      else{
        res.render("list",{kindofday:foundlist.name,newslistitems:foundlist.items});
      }
    }
  })

})


app.post("/",function(req,res){
  const itemName= req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    work: itemName
  })
  if(listName===date.getDate()){
  item.save();
  res.redirect("/")}
  else{
    List.findOne({name:listName},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);
    })
  }
})
app.post("/delete",function(req,res){
  const listName=req.body.listName;
  if(listName===date.getDate()){
  Item.findByIdAndRemove(req.body.checkbox,function(err){
  if(err){
    console.log();
  }
  else{
    console.log("Succesfully deleted the document");
    res.redirect("/");
  }
})}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:req.body.checkbox}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  })
}

  // console.log(req.body.checkbox);
})

app.listen(3000, function(){
  console.log("Server started on port 3000");
});
