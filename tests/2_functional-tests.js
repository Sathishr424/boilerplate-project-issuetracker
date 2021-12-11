const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test("Create an issue with every field: POST request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .post("/api/issues/:testField")
      .send({
        status_text: "test_status",
        issue_text: "test_issue",
        created_by: "test_created",
        assigned_to: "test_assigned",
        issue_title: "test_title"
      }).end((err,res)=>{
        assert.equal(res.status, 200);
        assert.exists(res.body._id);
        assert.equal(res.body.status_text, "test_status");
        assert.equal(res.body.issue_text, "test_issue");
        assert.equal(res.body.created_by, "test_created");
        assert.equal(res.body.assigned_to, "test_assigned");
        assert.equal(res.body.issue_title, "test_title");
        assert.exists(res.body.created_on);
        assert.exists(res.body.updated_on);
        assert.equal(res.body.open, true);
        done();
      })
  });
  test("Create an issue with only required fields: POST request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .post("/api/issues/testField")
      .send({
        issue_text: "test_issue",
        created_by: "test_created",
        issue_title: "test_title"
      }).end((err,res)=>{
        assert.equal(res.status, 200);
        assert.exists(res.body._id);
        assert.equal(res.body.status_text, "");
        assert.equal(res.body.issue_text, "test_issue");
        assert.equal(res.body.created_by, "test_created");
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.issue_title, "test_title");
        assert.exists(res.body.created_on);
        assert.exists(res.body.updated_on);
        assert.equal(res.body.open, true);
        done();
      })
  });
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .post("/api/issues/testField")
      .send({
        issue_text: "test_issue",
      }).end((err,res)=>{
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      })
  });
  test("View issues on a project: GET request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .get("/api/issues/testField")
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      })
  });
  test("View issues on a project with one filter: GET request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .get("/api/issues/testField?open=true")
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      })
  });
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .get("/api/issues/apitest?created_by=sathish&open=true")
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      })
  });
  test("Update one field on an issue: PUT request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({_id:"61b45c9e1ac2723775b9a3d2", created_by:"sathish"})
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {result: 'successfully updated', '_id': "61b45c9e1ac2723775b9a3d2" });
        done();
      })
  });
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({_id:"61b44bd9f892f04debdbcca7", open:false, issue_text:'changed'})
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {result: 'successfully updated', '_id': "61b44bd9f892f04debdbcca7" });
        done();
      })
  });
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({open:false, issue_text:'changed', created_by:'sathish'})
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      })
  });
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({_id:"61b44bd9f892f04debdbcca7"})
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'no update field(s) sent', '_id': "61b44bd9f892f04debdbcca7" });
        done();
      })
  });
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .put("/api/issues/apitest")
      .send({_id:"gasfh452341", open:false, issue_text:'changed'})
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not update', '_id': "gasfh452341" });
        done();
      })
  });
  test("Delete an issue: DELETE request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({_id:"61b44ea328051f177ada92fe"})
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully deleted', '_id': "61b44ea328051f177ada92fe" });
        done();
      })
  });
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .send({_id:"asgasdag"})
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not delete', '_id': "asgasdag" });
        done();
      })
  });
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done)=>{
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .end((err,res)=>{
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      })
  });
});
