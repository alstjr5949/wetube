import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import req from 'express/lib/request';

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

export const getEdit = (req, res) => {
  return res.render("edit-profile", {pageTitle: "Edit Profile"})
};

export const postEdit = async(req,res) => {
  const { 
    session: { 
      user : {_id, avatarUrl},
    },
    body: {name, email, username, location},
    file,
  } = req;
  const updatedUser = await User.findByIdAndUpdate(_id,{
    avatarUrl: file ? file.path : avatarUrl,
    name,
    email,
    username,
    location,
  },
  {new: true});
  req.session.user = updatedUser;
  return res.redirect('/users/edit');
};

export const getChangePassword = (req, res) => {
  return res.render("users/change-password", {pageTitle:"Change Password"})
};

export const postChangePassword = async(req, res) => {
  const { 
    session: { 
      user : {_id, password},
    },
    body: {oldPassword,
      newPassword,
      newPasswordConfirmation,},
  } = req;
  const ok = await bcrypt.compare(oldPassword, password);
  if(!ok){
    return res.status(400).render("users/change=password",{
      pageTitle : "Change Password", 
      errorMessage : "The current password is incorrect"
    });
  }
  if(newPassword !== newPasswordConfirmation){
    return res.status(400).render("users/change=password",{
      pageTitle : "Change Password", 
      errorMessage : "The password does not match the confirmation"
    });
  }
  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save();
  req.session.user.password = user.password;
  //send notification
  return res.redirect("/users/logout");
};

export const see = (req, res) => res.send('See User'); 