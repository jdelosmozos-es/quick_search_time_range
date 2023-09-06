odoo.define('quick_search_time_range.listview', function (require) {
"use strict";

var time        = require('web.time');
var core        = require('web.core');
var data        = require('web.data');
var session     = require('web.session');
var utils       = require('web.utils');
var _t = core._t;
var _lt = core._lt;
var QWeb = core.qweb;
var config      = require('web.config');

function is_mobile() {
    return config.device.size_class <= config.device.SIZES.XS;
}

var SearchTimeRange = {

    RenderDateRangePicker: function(this2, node) {
        var self = this2;
        var range_field  = self.$tmrange_time_range.find('.tmrange_select_field').val();
        var tmrange_is_datetime_field = self.tmrange_fields[range_field] == 'datetime' ? true : false;
        var l10n = _t.database.parameters,
            datetime_format = time.getLangDatetimeFormat(),
            server_datetime_format = tmrange_is_datetime_field ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';

        self.timerange_domain = [];
        var renderer = self.renderer;
        var oDomain = renderer.state.getDomain() || []

        self.update({
            'domain': oDomain
        }, undefined);

        self.$tmrange_time_range.find('.tmrange_time_field').css('width', tmrange_is_datetime_field ? 225 : 150);
        var today = _t('Today');
        var yesterday = _t('Yesterday')
        var last_7_days = _t('Last 7 Days')
        var last_30_days = _t('Last 30 Days')
        var this_month = _t('This Month')
        var last_month = _t('Last Month')
        self.$tmrange_time_range.find('.tmrange_time_field').daterangepicker({
            showDropdowns: true,
            timePicker: tmrange_is_datetime_field,
            timePickerIncrement: 5,
            timePicker24Hour: true,
            startDate: moment().startOf('day'),
            endDate: moment().startOf('day'),
            locale : {
                format: tmrange_is_datetime_field ? datetime_format.substring(0, 16): datetime_format.substring(0, 10),
                applyLabel: _t('Apply'),
                cancelLabel: _t('Cancel'),
                customRangeLabel: _t('Custom Range'),
            },
            // .set({hour:0,minute:0,second:0,millisecond:0})
            ranges: {
                [today]: [moment().startOf('day'), moment().endOf('day')],
                [yesterday]: [moment().startOf('day').subtract(1, 'days'), moment().endOf('day').subtract(1, 'days')],
                [last_7_days]: [moment().startOf('day').subtract(6, 'days'), moment().endOf('day')],
                [last_30_days]: [moment().startOf('day').subtract(29, 'days'), moment().endOf('day')],
                [this_month]: [moment().startOf('month'), moment().endOf('month')],
                [last_month]: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        });
        var tmrange_time_field = self.$tmrange_time_range.find('.tmrange_time_field')
        tmrange_time_field.val('');
        tmrange_time_field.on('cancel.daterangepicker', function(ev, picker) {
            tmrange_time_field.val('');
            self.timerange_domain = [];
            self.update({
                'domain': oDomain
            }, undefined);
        });
        tmrange_time_field.on('apply.daterangepicker', function(ev, picker) {
            var start = moment(picker.startDate),
                end = moment(picker.endDate);
            if (self.tmrange_fields[range_field] == 'datetime') {
                start.subtract(session.getTZOffset(start.format(server_datetime_format)), 'minutes');
                end.subtract(session.getTZOffset(end.format(server_datetime_format)), 'minutes');
            } 
            self.timerange_domain = [
                '&',
                [range_field, '>=', start.format(server_datetime_format)],
                [range_field, '<=', end.format(server_datetime_format)]
            ]
            if (self.timerange_domain.length > 0 && self.timerange_domain !== undefined) {
                var domain = oDomain.concat(self.timerange_domain)

                if (renderer.noContentHelp !== undefined) {
                    renderer.noContentHelp = false;
                }
                self.update({
                    'domain': domain
                }, undefined);
            } else {
                self.update({
                    'domain': oDomain
                }, undefined);
            }
        });
        self.$tmrange_time_range.appendTo(node);
    },

}

var ListController = require('web.ListController');
ListController.include({


    renderButtons: function ($node) {
        var self = this;
        this._super.apply(this, arguments);
        
        self.tmrange_fields = {};
        var tmrange_fields = [], tmp_fields = {};
        _.each(self.initialState.fields, function(value, key, list){
            if (value.store && value.type === "datetime" || value.type === "date") {
                tmp_fields[value.name] = [value.type, value.string];
            }
        });

        _.each(self.initialState.fieldsInfo.list, function(value, key, list){
            if (tmp_fields[value.name]) {
                self.tmrange_fields[ value.name ] = tmp_fields[value.name][0];
                tmrange_fields.push([value.name, value.string ||  tmp_fields[value.name][1]]);
            }
        });

        if (tmrange_fields.length > 0) {
            self.$tmrange_time_range = $(QWeb.render('tmrange.SearchTimeRange', {'tmrange_fields': tmrange_fields}))
            SearchTimeRange.RenderDateRangePicker(self, self.$buttons);
            self.$tmrange_time_range.find('.tmrange_select_field').on('change', function() {
                SearchTimeRange.RenderDateRangePicker(self, self.$buttons);
            })

        }
    },  

});

var KanbanController      = require('web.KanbanController');

KanbanController.include({
    

    renderButtons: function ($node) { 
        var self = this;
        this.$tmrange_node = $node;
        this._super.apply(this, arguments);

        self.tmrange_fields = {};
        var tmrange_fields = [], tmp_fields = {};
        _.each(self.initialState.fields, function(value, key, list){
            if (value.store && value.type === "datetime" || value.type === "date") {
                tmp_fields[value.name] = [value.type, value.string];
            }
        });
        _.each(self.initialState.fieldsInfo.kanban, function(value, key, list){
            if (tmp_fields[value.name]) {
                self.tmrange_fields[ value.name ] = tmp_fields[value.name][0];
                tmrange_fields.push([value.name, value.string || tmp_fields[value.name][1]]);
            }
        });

        if (tmrange_fields.length > 0) {
            self.$tmrange_time_range = $(QWeb.render('tmrange.SearchTimeRange', {'tmrange_fields': tmrange_fields}))
            SearchTimeRange.RenderDateRangePicker(self, self.$buttons);
            self.$tmrange_time_range.find('.tmrange_select_field').on('change', function() {
                SearchTimeRange.RenderDateRangePicker(self, self.$buttons);
            })

        }        
    },  

});


});