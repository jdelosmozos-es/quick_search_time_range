# -*- coding: utf-8 -*-
{
    "name": "Search time range",
    "version": "15.0.1.0",
    "author": "TM 723",
    "summary": "Easy search time range in listview, pivot, kanban",
    'license': 'LGPL-3',
    'images': ['static/description/listview.png'],
    "category": "web",
    "depends": ['web'],
    "data": [],
    'assets': {
        'web.assets_backend': [
            'quick_search_time_range/static/src/js/daterangepicker.js',
            'quick_search_time_range/static/src/js/quick_search_time_range.js',
            'quick_search_time_range/static/src/css/daterangepicker.css',
            'quick_search_time_range/static/src/css/tm723_date_range_picker.css',
        ],'web.assets_qweb': [
            'quick_search_time_range/static/src/xml/template.xml',
            ],
    },
    "installable": True,
}
