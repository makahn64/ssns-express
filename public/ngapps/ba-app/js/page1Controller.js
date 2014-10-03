/**
 * This is the main controller for the app and does all the real work of switching screens, etc.
 *

 */

app.controller("page1Controller", function($scope){


    $scope.model  =  {};
    $scope.pageName = "Which of these facts surprise you the most?";
    $scope.answers = [
        "Nursing Home Care costs approximately $87,600 per year.",
        "70% of those over 65 will need some form of LTC such as home care, assisted living or nursing home care.",
         "70% of people have not planned for Long Term Care.",
        "Caregivers estimate they could have saved nearly $11,000 if they had made LTC arrangements earlier.",
        "On average, Americans hope to live until they are 90.",
        "59% of Americans are uncomfortable talking to their family about LTC.",
        "43% anticipate needing to help care for a friend of family member in the next 5 years.",
        "About 8,200 Americans turn 65 everyday.",
        "Medicaid only covers LTC if assets are below $2,000.",
        "68% of adults worry about how they will afford to care for themselves as they age."
    ];


});
