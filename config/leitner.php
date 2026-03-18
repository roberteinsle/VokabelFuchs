<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Leitner Box Drawer Intervals (in days)
    |--------------------------------------------------------------------------
    |
    | Defines how many days until a card in each drawer becomes due for review.
    | Index = drawer number (1-5).
    |
    */
    'intervals' => [
        1 => 1,   // Drawer 1: daily
        2 => 2,   // Drawer 2: every 2 days
        3 => 5,   // Drawer 3: every 5 days
        4 => 10,  // Drawer 4: every 10 days
        5 => 30,  // Drawer 5: every 30 days (mastered)
    ],

    /*
    |--------------------------------------------------------------------------
    | Number of Drawers
    |--------------------------------------------------------------------------
    */
    'drawers' => 5,

    /*
    |--------------------------------------------------------------------------
    | Cards Per Training Session
    |--------------------------------------------------------------------------
    |
    | Maximum number of due cards loaded per training session.
    |
    */
    'session_card_limit' => 20,

    /*
    |--------------------------------------------------------------------------
    | Multiple Choice Option Count
    |--------------------------------------------------------------------------
    |
    | Number of wrong options shown alongside the correct answer.
    |
    */
    'multiple_choice_options' => 3,
];
