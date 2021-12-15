import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render('join', {pageTitle: "Join"});
export const postJoin = async(req, res) => {
  const {name,username,email,password, password2, location} = req.body;
  const exists = await User.exists({$or: [{username},{email}]});
  const pageTitle = "Join";
  if(password !== password2){
    return res.status(400).render("join", {pageTitle, errorMessage : "Password confirmation does not match."});
  }
  if(exists){
    return res.status(400).render("join", {pageTitle, errorMessage : "This username/email is already taken."});
  }
  try{
    await User.create({
      name, username, email, password, location,
    });
    res.redirect("/login");    
  } catch (error){
    return res.status(400).render("join", { pageTitle, errorMessage: error._message, });
  };
}
export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});
export const postLogin = async(req, res) => {
  const {username, password} = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({username});
  if(!user){
    return res.status(400).render("login", {pageTitle, errorMessage:"An account with this username does not exists."});
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok){
    return res.status(400).render("login", {pageTitle, errorMessage:"Wrong password."});
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/")
};

export const edit = (req, res) => res.send('Edit User');
export const see = (req, res) => res.send('See User'); 