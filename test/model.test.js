
/**
 * Test dependencies.
 */

var start = require('./common')
  , should = require('should')
  , mongoose = start.mongoose
  , random = require('mongoose/utils').random
  , Query = require('mongoose/query').Query
  , FindQuery = require('mongoose/query').FindQuery
  , Schema = mongoose.Schema
  , SchemaType = mongoose.SchemaType
  , CastError = SchemaType.CastError
  , ValidatorError = SchemaType.ValidatorError
  , ObjectId = Schema.ObjectId
  , DocumentObjectId = mongoose.Types.ObjectId
  , DocumentArray = mongoose.Types.DocumentArray
  , EmbeddedDocument = mongoose.Types.Document
  , MongooseNumber = mongoose.Types.Number
  , MongooseArray = mongoose.Types.Array
  , MongooseError = mongoose.Error;

/**
 * Setup.
 */

var Comments = new Schema();

Comments.add({
    title     : String
  , date      : Date
  , body      : String
  , comments  : [Comments]
});

var BlogPost = new Schema({
    title     : String
  , slug      : String
  , date      : Date
  , meta      : {
        date      : Date
      , visitors  : Number
    }
  , published : Boolean
  , owners    : [ObjectId]
  , comments  : [Comments]
});

BlogPost.method('cool', function(){
  return this;
});

BlogPost.static('woot', function(){
  return this;
});

mongoose.model('BlogPost', BlogPost);

var collection = 'blogposts_' + random();

module.exports = {

  'test a model isNew flag when instantiating': function(){
    var db = start()
      , BlogPost = db.model('BlogPost', collection);

    var post = new BlogPost();
    post.isNew.should.be.true;
    db.close();
  },

  'test presence of model schema': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    BlogPost.schema.should.be.an.instanceof(Schema);
    BlogPost.prototype.schema.should.be.an.instanceof(Schema);
    db.close();
  },

  'test a model default structure when instantiated': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost();
    post.isNew.should.be.true;

    post.get('_id').should.be.an.instanceof(DocumentObjectId);

    should.strictEqual(post.get('title'), null);
    should.strictEqual(post.get('slug'), null);
    should.strictEqual(post.get('date'), null);

    post.get('meta').should.be.a('object');
    post.get('meta').should.eql({
        date: null
      , visitors: null
    });

    should.strictEqual(post.get('published'), null);

    post.get('owners').should.be.an.instanceof(MongooseArray);
    post.get('comments').should.be.an.instanceof(DocumentArray);
    db.close();
  },

  'test a model structure when saved': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost();
    post.save(function(err){
      should.strictEqual(err, null);
      post.get('_id').should.be.an.instanceof(DocumentObjectId);

      should.strictEqual(post.get('title'), null);
      should.strictEqual(post.get('slug'), null);
      should.strictEqual(post.get('date'), null);

      post.get('meta').should.be.a('object');
      post.get('meta').should.eql({
          date: null
        , visitors: null
      });

      should.strictEqual(post.get('published'), null);

      post.get('owners').should.be.an.instanceof(MongooseArray);
      post.get('comments').should.be.an.instanceof(DocumentArray);
      db.close();
    });
  },

  'test a model structure when initd': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost()
    post.init({
        title       : 'Test'
      , slug        : 'test'
      , date        : new Date
      , meta        : {
            date      : new Date
          , visitors  : 5
        }
      , published   : true
      , owners      : [new DocumentObjectId, new DocumentObjectId]
      , comments    : [
                          { title: 'Test', date: new Date, body: 'Test' }
                        , { title: 'Super', date: new Date, body: 'Cool' }
                      ]
    });

    post.get('title').should.eql('Test');
    post.get('slug').should.eql('test');
    post.get('date').should.be.an.instanceof(Date);
    post.get('meta').should.be.a('object');
    post.get('meta').date.should.be.an.instanceof(Date);
    post.get('meta').visitors.should.be.an.instanceof(MongooseNumber);
    post.get('published').should.be.true;

    post.title.should.eql('Test');
    post.slug.should.eql('test');
    post.date.should.be.an.instanceof(Date);
    post.meta.should.be.a('object');
    post.meta.date.should.be.an.instanceof(Date);
    post.meta.visitors.should.be.an.instanceof(MongooseNumber);
    post.published.should.be.true;

    post.get('owners').should.be.an.instanceof(MongooseArray);
    post.get('owners')[0].should.be.an.instanceof(DocumentObjectId);
    post.get('owners')[1].should.be.an.instanceof(DocumentObjectId);

    post.owners.should.be.an.instanceof(MongooseArray);
    post.owners[0].should.be.an.instanceof(DocumentObjectId);
    post.owners[1].should.be.an.instanceof(DocumentObjectId);

    post.get('comments').should.be.an.instanceof(DocumentArray);
    post.get('comments')[0].should.be.an.instanceof(EmbeddedDocument);
    post.get('comments')[1].should.be.an.instanceof(EmbeddedDocument);

    post.comments.should.be.an.instanceof(DocumentArray);
    post.comments[0].should.be.an.instanceof(EmbeddedDocument);
    post.comments[1].should.be.an.instanceof(EmbeddedDocument);

    db.close();
  },

  'test a model structure when partially initd': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost()
    post.init({
        title       : 'Test'
      , slug        : 'test'
      , date        : new Date
    });

    post.get('title').should.eql('Test');
    post.get('slug').should.eql('test');
    post.get('date').should.be.an.instanceof(Date);
    post.get('meta').should.be.a('object');

    post.get('meta').should.eql({
        date: null
      , visitors: null
    });

    should.strictEqual(post.get('published'), null);

    post.get('owners').should.be.an.instanceof(MongooseArray);
    post.get('comments').should.be.an.instanceof(DocumentArray);
    db.close();
  },

  'test isNew on embedded documents after initing': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost()
    post.init({
        title       : 'Test'
      , slug        : 'test'
      , comments    : [ { title: 'Test', date: new Date, body: 'Test' } ]
    });

    post.get('comments')[0].isNew.should.be.false;
    db.close();
  },

  'test isModified when modifying keys': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost()
    post.init({
        title       : 'Test'
      , slug        : 'test'
      , date        : new Date
    });

    post.isModified('title').should.be.false;
    post.set('title', 'test');
    post.isModified('title').should.be.true;

    post.isModified('date').should.be.false;
    post.set('date', Date.now());
    post.isModified('date').should.be.true;

    post.isModified('meta.date').should.be.false;
    db.close();
  },

  'test isModified on a DocumentArray': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost()
    post.init({
        title       : 'Test'
      , slug        : 'test'
      , comments    : [ { title: 'Test', date: new Date, body: 'Test' } ]
    });

    post.isModified('comments').should.be.false;
    post.get('comments')[0].set('title', 'Woot');
    post.isModified('comments').should.be.true;

    db.close();
  },

  'test isModified on a DocumentArray with accessors': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost()
    post.init({
        title       : 'Test'
      , slug        : 'test'
      , comments    : [ { title: 'Test', date: new Date, body: 'Test' } ]
    });

    post.isModified('comments').should.be.false;
    post.get('comments')[0].body = 'Woot';
    post.isModified('comments').should.be.true;

    db.close();
  },

  'test isModified on a MongooseArray with atomics methods': function(){
    // COMPLETEME
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost()

    post.isModified('owners').should.be.false;
    post.get('owners').$push(new DocumentObjectId);
    post.isModified('owners').should.be.true;

    db.close();
  },

  'test isModified on a MongooseArray with native methods': function(){
    // COMPLETEME
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost()

    post.isModified('owners').should.be.false;
    post.get('owners').push(new DocumentObjectId);

    db.close();
  },

  'test defining a new method': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost();
    post.cool().should.eql(post);
    db.close();
  },

  'test defining a static': function(){
    var db = start()
      , BlogPost = db.model('BlogPost');

    BlogPost.woot().should.eql(BlogPost);
    db.close();
  },

  'test casting error': function(){
    var db = start()
      , BlogPost = db.model('BlogPost')
      , threw = false;

    var post = new BlogPost();
    
    try {
      post.init({
          date: 'Test'
      });
    } catch(e){
      threw = true;
    }

    threw.should.be.false;

    try {
      post.set('title', 'Test');
    } catch(e){
      threw = true;
    }

    threw.should.be.false;

    post.save(function(err){
      err.should.be.an.instanceof(MongooseError);
      err.should.be.an.instanceof(CastError);
      db.close();
    });
  },
  
  'test nested casting error': function(){
    var db = start()
      , BlogPost = db.model('BlogPost')
      , threw = false;

    var post = new BlogPost();

    try {
      post.init({
          meta: {
              date: 'Test'
          }
      });
    } catch(e){
      threw = true;
    }

    threw.should.be.false;

    try {
      post.set('meta.date', 'Test');
    } catch(e){
      threw = true;
    }

    threw.should.be.false;
    
    post.save(function(err){
      err.should.be.an.instanceof(MongooseError);
      err.should.be.an.instanceof(CastError);
      db.close();
    });
  },

  'test casting error in subdocuments': function(){
    var db = start()
      , BlogPost = db.model('BlogPost')
      , threw = false;

    var post = new BlogPost()
    post.init({
        title       : 'Test'
      , slug        : 'test'
      , comments    : [ { title: 'Test', date: new Date, body: 'Test' } ]
    });

    post.get('comments')[0].set('date', 'invalid');

    post.save(function(err){
      err.should.be.an.instanceof(MongooseError);
      err.should.be.an.instanceof(CastError);
      db.close();
    });
  },

  'test casting error when adding a subdocument': function(){
    var db = start()
      , BlogPost = db.model('BlogPost')
      , threw = false;

    var post = new BlogPost()

    try {
      post.get('comments').push({
          date: 'Bad date'
      });
    } catch (e) {
      threw = true;
    }

    threw.should.be.false;

    post.save(function(err){
      err.should.be.an.instanceof(MongooseError);
      err.should.be.an.instanceof(CastError);
      db.close();
    });
  },

  'test validation': function(){
    mongoose.model('TestValidation', new Schema({
        simple: { type: String, required: true }
    }));

    var db = start()
      , TestValidation = db.model('TestValidation');

    var post = new TestValidation();
    post.set('simple', '');

    post.save(function(err){
      err.should.be.an.instanceof(MongooseError);
      err.should.be.an.instanceof(ValidatorError);

      post.set('simple', 'here');
      post.save(function(err){
        should.strictEqual(err, null);
        db.close();
      });
    });
  },
  
  'test nested validation': function(){
    mongoose.model('TestNestedValidation', new Schema({
        nested: {
            required: { type: String, required: true }
        }
    }));

    var db = start()
      , TestNestedValidation = db.model('TestNestedValidation');

    var post = new TestNestedValidation();
    post.set('nested.required', null);

    post.save(function(err){
      err.should.be.an.instanceof(MongooseError);
      err.should.be.an.instanceof(ValidatorError);

      post.set('nested.required', 'here');
      post.save(function(err){
        should.strictEqual(err, null);
        db.close();
      });
    });
  },

  'test validation in subdocuments': function(){
    var Subdocs = new Schema({
        required: { type: String, required: true }
    });

    mongoose.model('TestSubdocumentsValidation', new Schema({
        items: [Subdocs]
    }));

    var db = start()
      , TestSubdocumentsValidation = db.model('TestSubdocumentsValidation');

    var post = new TestSubdocumentsValidation();

    post.get('items').push({ required: '' });

    post.save(function(err){
      err.should.be.an.instanceof(MongooseError);
      err.should.be.an.instanceof(ValidatorError);

      post.get('items')[0].set('required', true);
      post.save(function(err){
        should.strictEqual(err, null);
        db.close();
      });
    });
  },

  'test async validation': function(){
    var executed = false;

    function validator(v, fn){
      setTimeout(function () {
        executed = true;
        fn(v !== 'test');
      }, 50);
    };
    mongoose.model('TestAsyncValidation', new Schema({
        async: { type: String, validate: [validator, 'async validator'] }
    }));

    var db = start()
      , TestAsyncValidation = db.model('TestAsyncValidation');

    var post = new TestAsyncValidation();
    post.set('async', 'test');

    post.save(function(err){
      err.should.be.an.instanceof(MongooseError);
      err.should.be.an.instanceof(ValidatorError);
      executed.should.be.true;
      executed = false;

      post.set('async', 'woot');
      post.save(function(err){
        executed.should.be.true;
        should.strictEqual(err, null);
        db.close();
      });
    });
  },

  'test nested async validation': function(){
    var executed = false;

    function validator(v, fn){
      setTimeout(function () {
        executed = true;
        fn(v !== 'test');
      }, 50);
    };
    
    mongoose.model('TestNestedAsyncValidation', new Schema({
        nested: {
            async: { type: String, validate: [validator, 'async validator'] }
        }
    }));

    var db = start()
      , TestNestedAsyncValidation = db.model('TestNestedAsyncValidation');

    var post = new TestNestedAsyncValidation();
    post.set('nested.async', 'test');

    post.save(function(err){
      err.should.be.an.instanceof(MongooseError);
      err.should.be.an.instanceof(ValidatorError);
      executed.should.be.true;
      executed = false;

      post.set('nested.async', 'woot');
      post.save(function(err){
        executed.should.be.true;
        should.strictEqual(err, null);
        db.close();
      });
    });
  },

  'test async validation in subdocuments': function(){
    var executed = false;

    function validator (v, fn) {
      setTimeout(function(){
        executed = true;
        fn(v !== '');
      }, 50);
    };

    var Subdocs = new Schema({
        required: { type: String, validate: [validator, 'async in subdocs'] }
    });

    mongoose.model('TestSubdocumentsAsyncValidation', new Schema({
        items: [Subdocs]
    }));

    var db = start()
      , Test = db.model('TestSubdocumentsAsyncValidation');

    var post = new Test();

    post.get('items').push({ required: '' });

    post.save(function(err){
      err.should.be.an.instanceof(MongooseError);
      err.should.be.an.instanceof(ValidatorError);
      executed.should.be.true;
      executed = false;

      post.get('items')[0].set({ required: 'here' });
      post.save(function(err){
        executed.should.be.true;
        should.strictEqual(err, null);
        db.close();
      });
    });
  },

  'test defaults application': function(){
    var now = Date.now();

    mongoose.model('TestDefaults', new Schema({
        date: { type: Date, default: now }
    }));

    var db = start()
      , TestDefaults = db.model('TestDefaults');

    var post = new TestDefaults();
    post.get('date').should.be.an.instanceof(Date);
    (+post.get('date')).should.eql(now);
    db.close();
  },

  'test nested defaults application': function(){
    var now = Date.now();

    mongoose.model('TestNestedDefaults', new Schema({
        nested: {
            date: { type: Date, default: now }
        }
    }));

    var db = start()
      , TestDefaults = db.model('TestNestedDefaults');

    var post = new TestDefaults();
    post.get('nested.date').should.be.an.instanceof(Date);
    (+post.get('nested.date')).should.eql(now);
    db.close();
  },
  
  'test defaults application in subdocuments': function(){
    var now = Date.now();

    var Items = new Schema({
        date: { type: Date, default: now }
    });

    mongoose.model('TestSubdocumentsDefaults', new Schema({
        items: [Items]
    }));

    var db = start()
      , TestSubdocumentsDefaults = db.model('TestSubdocumentsDefaults');

    var post = new TestSubdocumentsDefaults();
    post.get('items').push({});
    post.get('items')[0].get('date').should.be.an.instanceof(Date);
    (+post.get('items')[0].get('date')).should.eql(now);
    db.close();
  },
  
  // TODO: adapt this text to handle a getIndexes callback that's not unique to
  // the mongodb-native driver.
  'test that indexes are ensured when the model is compiled': function(){
    var Indexed = new Schema({
        name  : { type: String, index: true }
      , last  : String
      , email : String
    });

    Indexed.index({ last: 1, email: 1 }, { unique: true });

    mongoose.model('IndexedModel', Indexed);

    var db = start()
      , IndexedModel = db.model('IndexedModel', 'indexedmodel' + random())
      , assertions = 0;

    IndexedModel.on('index', function(){
      IndexedModel.collection.getIndexes(function(err, indexes){
        for (var i in indexes)
          indexes[i].forEach(function(index){
            if (index[0] == 'name')
              assertions++;
            if (index[0] == 'last')
              assertions++;
            if (index[0] == 'email')
              assertions++;
          });
        assertions.should.eql(3);
        db.close();
      });
    });
  },

  'test middleware': function () {
    var schema = new Schema({
        title: String
    });

    var called = 0;

    schema.pre('init', function (next) {
      called++;
      next();
    });

    schema.pre('save', function (next) {
      called++;
      next(new Error('Error 101'));
    });

    schema.pre('remove', function (next) {
      called++;
      next();
    });

    mongoose.model('TestMiddleware', schema);

    var db = start()
      , TestMiddleware = db.model('TestMiddleware');

    var test = new TestMiddleware();

    test.init({
        title: 'Test'
    });
   
    called.should.eql(1);

    test.save(function(err){
      err.should.be.an.instanceof(Error);
      err.message.should.eql('Error 101');
      called.should.eql(2);

      test.remove(function(err){
        should.strictEqual(err, null);
        called.should.eql(3);
        db.close();
      });
    });
  },

  'test that find returns a Query': function () {
    var db = start()
      , BlogPost = db.model('BlogPost');
    
    // query
    BlogPost.find({}).should.be.an.instanceof(Query);
    BlogPost.find({}).executed.should.be.false;

    // query, fields
    BlogPost.find({}, {}).should.be.an.instanceof(Query);
    BlogPost.find({}, {}).executed.should.be.false;

    // query, fields (array)
    BlogPost.find({}, []).should.be.an.instanceof(Query);
    BlogPost.find({}, []).executed.should.be.false;

    // query, fields, options
    BlogPost.find({}, {}, {}).should.be.an.instanceof(Query);
    BlogPost.find({}, {}, {}).executed.should.be.false;

    // query, fields (array), options
    BlogPost.find({}, [], {}).should.be.an.instanceof(Query);
    BlogPost.find({}, [], {}).executed.should.be.false;

    db.close();
  },

  'test that findOne returns a Query': function () {
    var db = start()
      , BlogPost = db.model('BlogPost');
    
    // query
    BlogPost.findOne({}).should.be.an.instanceof(Query);
    BlogPost.findOne({}).executed.should.be.false;

    // query, fields
    BlogPost.findOne({}, {}).should.be.an.instanceof(Query);
    BlogPost.findOne({}, {}).executed.should.be.false;

    // query, fields (array)
    BlogPost.findOne({}, []).should.be.an.instanceof(Query);
    BlogPost.findOne({}, []).executed.should.be.false;

    // query, fields, options
    BlogPost.findOne({}, {}, {}).should.be.an.instanceof(Query);
    BlogPost.findOne({}, {}, {}).executed.should.be.false;

    // query, fields (array), options
    BlogPost.findOne({}, [], {}).should.be.an.instanceof(Query);
    BlogPost.findOne({}, [], {}).executed.should.be.false;

    db.close();
  },

  'test that a query is executed when a callback is passed': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , count = 10
      , q =  { _id: new DocumentObjectId }; // make sure the query is fast

    function fn () {
      --count || db.close();
    };
    
    // query
    BlogPost.find(q, fn).should.be.an.instanceof(Query);
    BlogPost.find(q, fn).executed.should.be.true;

    // query, fields
    BlogPost.find(q, {}, fn).should.be.an.instanceof(Query);
    BlogPost.find(q, {}, fn).executed.should.be.true;

    // query, fields (array)
    BlogPost.find(q, [], fn).should.be.an.instanceof(Query);
    BlogPost.find(q, [], fn).executed.should.be.true;

    // query, fields, options
    BlogPost.find(q, {}, {}, fn).should.be.an.instanceof(Query);
    BlogPost.find(q, {}, {}, fn).executed.should.be.true;

    // query, fields (array), options
    BlogPost.find(q, [], {}, fn).should.be.an.instanceof(Query);
    BlogPost.find(q, [], {}, fn).executed.should.be.true;
  },

  'test that query is executed with a callback for findOne': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , count = 10
      , q =  { _id: new DocumentObjectId }; // make sure the query is fast

    function fn () {
      --count || db.close();
    };
    
    // query
    BlogPost.findOne(q, fn).should.be.an.instanceof(Query);
    BlogPost.findOne(q, fn).executed.should.be.true;

    // query, fields
    BlogPost.findOne(q, {}, fn).should.be.an.instanceof(Query);
    BlogPost.findOne(q, {}, fn).executed.should.be.true;

    // query, fields (array)
    BlogPost.findOne(q, [], fn).should.be.an.instanceof(Query);
    BlogPost.findOne(q, [], fn).executed.should.be.true;

    // query, fields, options
    BlogPost.findOne(q, {}, {}, fn).should.be.an.instanceof(Query);
    BlogPost.findOne(q, {}, {}, fn).executed.should.be.true;

    // query, fields (array), options
    BlogPost.findOne(q, [], {}, fn).should.be.an.instanceof(Query);
    BlogPost.findOne(q, [], {}, fn).executed.should.be.true;
  },

  'test that count returns a Query': function () {
    var db = start()
      , BlogPost = db.model('BlogPost');

    BlogPost.count({}).should.be.an.instanceof(Query);
    BlogPost.count({}).executed.should.be.false;

    db.close();
  },

  'test that count Query executes when you pass a callback': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , count = 2;

    function fn () {
      --count || db.close();
    };

    BlogPost.count({}, fn).should.be.an.instanceof(Query);
    BlogPost.count({}, fn).executed.should.be.true;
  },

  'test that update returns a Query': function () {
    var db = start()
      , BlogPost = db.model('BlogPost');

    BlogPost.update({}, {}).should.be.an.instanceof(Query);
    BlogPost.update({}, {}).executed.should.be.false;

    BlogPost.update({}, {}, {}).should.be.an.instanceof(Query);
    BlogPost.update({}, {}, {}).executed.should.be.false;

    db.close();
  },

  'test that update Query executes when you pass a callback': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , count = 4;

    function fn () {
      --count || db.close();
    };

    BlogPost.update({}, {}, fn).should.be.an.instanceof(Query);
    BlogPost.update({}, {}, fn).executed.should.be.true;

    BlogPost.update({}, {}, {}, fn).should.be.an.instanceof(Query);
    BlogPost.update({}, {}, {}, fn).executed.should.be.true;
  },

  'test finding a document': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , title = 'Wooooot ' + random();

    var post = new BlogPost();
    post.set('title', title);

    post.save(function (err) {
      should.strictEqual(err, null);

      BlogPost.findOne({ title: title }, function (err, doc) {
        should.strictEqual(err, null);
        doc.get('title').should.eql(title);
        doc.isNew.should.be.false;

        db.close();
      });
    });
  },

  'test finding a document byId': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , title = 'Edwald ' + random();

    var post = new BlogPost();
    post.set('title', title);

    post.save(function (err) {
      should.strictEqual(err, null);

      BlogPost.findById(post.get('_id'), function (err, doc) {
        should.strictEqual(err, null);
        doc.should.be.an.instanceof(BlogPost);
        doc.get('title').should.eql(title);

        db.close();
      });
    });
  },

  'test finding documents': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , title = 'Wooooot ' + random();

    var post = new BlogPost();
    post.set('title', title);

    post.save(function (err) {
      should.strictEqual(err, null);

      var post = new BlogPost();
      post.set('title', title);

      post.save(function (err) {
        should.strictEqual(err, null);

        BlogPost.find({ title: title }, function (err, docs) {
          should.strictEqual(err, null);
          docs.should.have.length(2);

          docs[0].get('title').should.eql(title);
          docs[0].isNew.should.be.false;

          docs[1].get('title').should.eql(title);
          docs[1].isNew.should.be.false;

          db.close();
        });
      });
    });
  },

  'test counting documents': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , title = 'Wooooot ' + random();

    var post = new BlogPost();
    post.set('title', title);

    post.save(function (err) {
      should.strictEqual(err, null);

      var post = new BlogPost();
      post.set('title', title);

      post.save(function (err) {
        should.strictEqual(err, null);

        BlogPost.count({ title: title }, function (err, count) {
          should.strictEqual(err, null);

          count.should.be.a('number');
          count.should.eql(2);

          db.close();
        });
      });
    });
  },

  'test updating documents': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , title = 'Tobi ' + random()
      , newTitle = 'Woot ' + random();

    var post = new BlogPost();
    post.set('title', title);

    post.save(function (err) {
      should.strictEqual(err, null);

      BlogPost.update({ title: title }, { title: newTitle }, function (err) {
        should.strictEqual(err, null);

        BlogPost.count({ title: newTitle }, function (err, count) {
          should.strictEqual(err, null);
          
          count.should.eql(1);
          db.close();
        });
      });
    });
  },

  'test query casting': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , title = 'Loki ' + random();

    var post = new BlogPost()
      , id = DocumentObjectId.toString(post.get('_id'));

    post.set('title', title);

    post.save(function (err) {
      should.strictEqual(err, null);

      BlogPost.findOne({ _id: id }, function (err, doc) {
        should.strictEqual(err, null);

        doc.get('title').should.equal(title);
        db.close();
      });
    });
  },

  'test update doc casting': function () {
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost();
    post.set('title', '1');

    var id = post.get('_id');

    post.save(function (err) {
      should.strictEqual(err, null);

      BlogPost.update({ title: 1, _id: id }, { title: 2 }, function (err) {
        should.strictEqual(err, null);

        BlogPost.findOne({ _id: post.get('_id') }, function (err, doc) {
          should.strictEqual(err, null);

          doc.get('title').should.eql('2');
          db.close();
        });
      });
    });
  },

  'test updating numbers atomically': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , totalDocs = 4
      , saveQueue = [];

    var post = new BlogPost();
    post.set('meta.visitors', 5);

    post.save(function(err){
      if (err) throw err;

      BlogPost.findOne({ _id: post.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('meta.visitors').increment();
        doc.get('meta.visitors').valueOf().should.be.equal(6);
        save(doc);
      });

      BlogPost.findOne({ _id: post.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('meta.visitors').increment();
        doc.get('meta.visitors').valueOf().should.be.equal(6);
        save(doc);
      });

      BlogPost.findOne({ _id: post.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('meta.visitors').increment();
        doc.get('meta.visitors').valueOf().should.be.equal(6);
        save(doc);
      });

      BlogPost.findOne({ _id: post.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('meta.visitors').increment();
        doc.get('meta.visitors').valueOf().should.be.equal(6);
        save(doc);
      });

      function save(doc) {
        saveQueue.push(doc);
        if (saveQueue.length == 4)
          saveQueue.forEach(function (doc) {
            doc.save(function (err) {
              if (err) throw err;
              --totalDocs || complete();
            });
          });
      };

      function complete () {
        BlogPost.findOne({ _id: post.get('_id') }, function (err, doc) {
          if (err) throw err;
          doc.get('meta.visitors').valueOf().should.be.equal(9);
          db.close();
        });
      };
    });
  },

  'test saving subdocuments atomically': function () {
    var db = start()
      , BlogPost = db.model('BlogPost')
      , totalDocs = 4
      , saveQueue = [];
    
    var post = new BlogPost();

    post.save(function(err){
      if (err) throw err;

      BlogPost.findOne({ _id: post.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('comments').push({ title: '1' });
        save(doc);
      });

      BlogPost.findOne({ _id: post.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('comments').push({ title: '2' });
        save(doc);
      });

      BlogPost.findOne({ _id: post.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('comments').push({ title: '3' });
        save(doc);
      });

      BlogPost.findOne({ _id: post.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('comments').push({ title: '4' }, { title: '5' });
        save(doc);
      });

      function save(doc) {
        saveQueue.push(doc);
        if (saveQueue.length == 4)
          saveQueue.forEach(function (doc) {
            doc.save(function (err) {
              if (err) throw err;
              --totalDocs || complete();
            });
          });
      };

      function complete () {
        BlogPost.findOne({ _id: post.get('_id') }, function (err, doc) {
          if (err) throw err;

          doc.get('comments').length.should.eql(5);

          doc.get('comments').some(function(comment){
            return comment.get('title') == '1';
          }).should.be.true;

          doc.get('comments').some(function(comment){
            return comment.get('title') == '2';
          }).should.be.true;

          doc.get('comments').some(function(comment){
            return comment.get('title') == '3';
          }).should.be.true;

          doc.get('comments').some(function(comment){
            return comment.get('title') == '4';
          }).should.be.true;

          doc.get('comments').some(function(comment){
            return comment.get('title') == '5';
          }).should.be.true;

          db.close();
        });
      };
    });
  },

  'test saving embedded arrays of Numbers atomically': function () {
    var db = start()
      , TempSchema = new Schema({
          nums: [Number]
        })
      , totalDocs = 2
      , saveQueue = [];

    mongoose.model('Temp', TempSchema);
    var Temp = db.model('Temp');
    
    var t = new Temp();

    t.save(function(err){
      if (err) throw err;

      Temp.findOne({ _id: t.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('nums').push(1);
        save(doc);
      });

      Temp.findOne({ _id: t.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('nums').push(2, 3);
        save(doc);
      });


      function save(doc) {
        saveQueue.push(doc);
        if (saveQueue.length == totalDocs)
          saveQueue.forEach(function (doc) {
            doc.save(function (err) {
              if (err) throw err;
              --totalDocs || complete();
            });
          });
      };

      function complete () {
        Temp.findOne({ _id: t.get('_id') }, function (err, doc) {
          if (err) throw err;

          doc.get('nums').length.should.eql(3);

          doc.get('nums').some(function(num){
            return num.valueOf() == '1';
          }).should.be.true;

          doc.get('nums').some(function(num){
            return num.valueOf() == '2';
          }).should.be.true;

          doc.get('nums').some(function(num){
            return num.valueOf() == '3';
          }).should.be.true;


          db.close();
        });
      };
    });
  },

  'test saving embedded arrays of Strings atomically': function () {
    var db = start()
      , StrListSchema = new Schema({
          strings: [String]
        })
      , totalDocs = 2
      , saveQueue = [];

    mongoose.model('StrList', StrListSchema);
    var StrList = db.model('StrList');
    
    var t = new StrList();

    t.save(function(err){
      if (err) throw err;

      StrList.findOne({ _id: t.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('strings').push('a');
        save(doc);
      });

      StrList.findOne({ _id: t.get('_id') }, function(err, doc){
        if (err) throw err;
        doc.get('strings').push('b', 'c');
        save(doc);
      });


      function save(doc) {
        saveQueue.push(doc);
        if (saveQueue.length == totalDocs)
          saveQueue.forEach(function (doc) {
            doc.save(function (err) {
              if (err) throw err;
              --totalDocs || complete();
            });
          });
      };

      function complete () {
        StrList.findOne({ _id: t.get('_id') }, function (err, doc) {
          if (err) throw err;

          doc.get('strings').length.should.eql(3);

          doc.get('strings').some(function(str){
            return str == 'a';
          }).should.be.true;

          doc.get('strings').some(function(str){
            return str == 'b';
          }).should.be.true;

          doc.get('strings').some(function(str){
            return str == 'c';
          }).should.be.true;

          db.close();
        });
      };
    });
  },

  'test a query that includes a casting error': function () {
    var db = start()
      , BlogPost = db.model('BlogPost');

    BlogPost.find({ date: 'invalid date' }, function (err) {
      err.should.be.an.instanceof(Error);
      err.should.be.an.instanceof(CastError);
      db.close();
    });
  },

  'test filtering an embedded array by the id shortcut function': function () {
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost();

    post.comments.push({ title: 'woot' });
    post.comments.push({ title: 'aaaa' });

    var subdoc1 = post.comments[0];
    var subdoc2 = post.comments[1];

    post.save(function (err) {
      should.strictEqual(err, null);

      BlogPost.findById(post.get('_id'), function (err, doc) {
        should.strictEqual(err, null);

        // test with an objectid
        doc.comments.id(subdoc1.get('_id')).title.should.eql('woot');

        // test with a string
        var id = DocumentObjectId.toString(subdoc2._id);
        doc.comments.id(id).title.should.eql('aaaa');

        db.close();
      });
    });
  },

  'test filtering an embedded array by the id with cast error': function () {
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost();

    post.save(function (err) {
      should.strictEqual(err, null);

      BlogPost.findById(post.get('_id'), function (err, doc) {
        should.strictEqual(err, null);
        should.strictEqual(doc.comments.id(null), null);

        db.close();
      });
    });
  },

  'test filtering an embedded array by the id shortcut with no match': function () {
    var db = start()
      , BlogPost = db.model('BlogPost');

    var post = new BlogPost();

    post.save(function (err) {
      should.strictEqual(err, null);

      BlogPost.findById(post.get('_id'), function (err, doc) {
        should.strictEqual(err, null);
        should.strictEqual(doc.comments.id(new DocumentObjectId), null);

        db.close();
      });
    });
  }

};
