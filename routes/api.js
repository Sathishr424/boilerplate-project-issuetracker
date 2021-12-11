'use strict';

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const issueSchema = new mongoose.Schema({
  issue_title: {type: String, required:true},
  issue_text: {type: String, required:true},
  created_by: {type: String, required:true},
  assigned_to: {type: String, default:""},
  status_text: {type: String, default:""},
  open: {type: Boolean, default:true},
  created_on: {type: Date},
  updated_on: {type: Date}
});

const projectSchema = new mongoose.Schema({
  project_name: String,
  issue_tracker: [issueSchema]
});

const Issue = new mongoose.model('Issue', projectSchema);
const IssueSchema = new mongoose.model('IssueSchema', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.query;
      let title = req.params.project;
      // console.log(title, "GET", project);
      Issue.findOne({project_name: title}, (err,data)=>{
        if (err) res.send({error: "ERROR"});
        else if(data){
          if (Object.keys(project).length < 1) res.json(data.issue_tracker);
          else{
            var ret = [];
            for (var i in data.issue_tracker){
              var match = true;
              for (var j in project){
                if (data.issue_tracker[i][j] != project[j]) {match = false; break}
              }if (match) ret.push(data.issue_tracker[i]);
            }res.send(ret);
          }
        }else res.send({error: "ERROR"});
      })
      
    })
    
    .post(function (req, res){
      let project = req.body;
      let title = req.params.project;
      // console.log(title, "POST", project);
      if (!project.issue_title || !project.issue_text || !project.created_by) res.json({ error: 'required field(s) missing' });
      else{
        Issue.findOne({project_name: title}, (err,data)=>{
          let issue  = new IssueSchema({
              status_text: project.status_text,
              issue_text: project.issue_text,
              created_by: project.created_by,
              assigned_to: project.assigned_to,
              issue_title: project.issue_title,
              open: true,
              created_on: new Date(),
              updated_on: new Date()
          });
          if (data){
            data.issue_tracker.push(issue);
            data.markModified('issue_tracker');
            data.save((err,data)=>{
              if (err) res.send(err);
              else {
                res.send(issue);
              }
            });
          }else{
            Issue.create({
              project_name: title,
              issue_tracker: [issue]
            }, (err,data)=>{
              if (err) res.send(err);
              else {
                res.send(issue);
              };
            })
          }
        })
      }
      
    })
    
    .put(function (req, res){
      let project = req.body;
      let title = req.params.project;
      // console.log(title, "PUT", project);
      if (!project._id) res.send({ error: 'missing _id' });
      else if (Object.keys(project).length  < 2) res.send({ error: 'no update field(s) sent', '_id': project._id });
      else{
        Issue.findOne({project_name: title}, (err,data)=>{
          if (err) {console.log(err); res.send({ error: 'could not update', '_id': project._id });}
          else{
            var issue;
            for (var i=0; i<data.issue_tracker.length; i++){
              if (data.issue_tracker[i]._id == project._id) {
                issue = data.issue_tracker[i];
                break;
              }
            }
            if (!issue) {res.send({ error: 'could not update', '_id': project._id });}
            else{
              for (var k in project){
                if (project[k]) issue[k] = project[k]
              }
              issue.updated_on = new Date();
              data.save((err,doc)=>{
                if (err) {console.log(err); res.send({ error: 'could not update', '_id': project._id });}
                else res.send({  result: 'successfully updated', '_id': project._id })
              });
            }
          }
        })
      }
    })
    
    .delete(function (req, res){
      let project = req.body;
      let title = req.params.project;
      // console.log(title, "DELETE", project);
      if (!project._id) res.send({ error: 'missing _id' });
      else Issue.findOne({project_name:title}, (err,data)=>{
        if (err) res.send({ error: 'could not delete', '_id': project._id });
        if (data){
          var deleted = false;
          for (var i in data.issue_tracker){
            if (data.issue_tracker[i]._id == project._id) {
              data.issue_tracker.splice(i,1);
              deleted = true;
              res.send({ result: 'successfully deleted', '_id': project._id });
              break;
            }
          }if (!deleted) res.send({ error: 'could not delete', '_id': project._id });
        }else res.send({ error: 'could not delete', '_id': project._id });
      });
    });
    
};
