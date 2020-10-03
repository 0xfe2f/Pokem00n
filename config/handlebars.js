const handlebars = require("express-handlebars");

module.exports = handlebars({
    defaultLayout: "admin/admin-template",
    layoutsDir: "src/views",
    helpers: {
        md5: function(a) {
            return a.split(".")[0];
        },
        inc: function(values, opts) {
            return parseInt(value) + 1;
        },
        is: function(a, b, opts) {
            if (a == b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        },
        isnot: function(a, b, opts) {
            if (a != b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        },
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        css: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        },
        json: function(context) {
            return JSON.stringify(context);
        },
        arr: function(context) {
            let str = "";
            for (let i = 0; i < context.length; i++)
                str += `${context[i]},`;
            return str + "";
        },
        inc: function(value) {
            return parseInt(value) + 1;
        }
    },
    extname: ".hbs"
});