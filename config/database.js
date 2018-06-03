
// ========================================================
// Exporting to mLab database
// ========================================================

module.exports = {

    'url' : 'mongodb://complicationlamp:gradschool1@ds263759.mlab.com:63759/blog-posts-1'
};

// =====================================================
// exporting for the tet features ======================
// =====================================================

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/GiftEx_test';

// exports.TEST_DATABASE_URL = {
//     'url' : 'mongodb://complicationlamp:gradschool1@ds139920.mlab.com:39920/test-users-db'
// }

// process.env.TEST_DATABASE_URL || 'mongodb://<complicationlamp>:<gradschool1>@ds139920.mlab.com:39920/test-users-db';
// exports.PORT = process.env.PORT || 8080;