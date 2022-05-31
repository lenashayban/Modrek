var app = angular.module('myApp', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'index.html',
        })
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'loginCtrl'
        })
        .when('/signup', {
            templateUrl: 'signup.html',
            controller: 'signupCtrl'
        })
        .when('/home', {
            templateUrl: 'home.html',
            controller: 'homeCtrl'
        })
        .when('/upload', {
            templateUrl: 'upload.html',
            controller: 'uploadCtrl'
        })
        .when('/reset', {
            templateUrl: 'resetPass.html',
            controller: 'resetCtrl'
        })
        .when('/history', {
            templateUrl: 'history.html',
            controller: 'historyCtrl'
        })
        .when('/deleteProject', {
            controller: 'deleteProjectCtrl'
        })
        .when('/waiting', {
            templateUrl: 'waiting.html'
        })
        .when('/projectName', {
            templateUrl: 'pName.html',
            controller: 'projectNameCtrl'
        })
        .when('/visualizations', {
            templateUrl: 'chartCh.html',
            controller: 'resultsCtrl'
        })
        .when('/classified', {
            templateUrl: 'tweets.html',
            controller: 'classifiedCtrl'
        })
        .otherwise({
            redirectTo: '/'
        })
});

app.controller('signupCtrl', function ($scope, $location, $rootScope) {
    console.log('signupCtrl');
    if ($rootScope.auth == true) {
        console.log('auth true');
        $rootScope.$apply(function () {
            $location.path("/home");
        });
    }
    $scope.signup = function () {
        var emailExist = false;
        if (validateSignupForm()) {
            auth.createUserWithEmailAndPassword($scope.email, $scope.password)
                .catch(error => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    if (errorCode === 'auth/email-already-in-use') {
                        document.getElementById('email').setCustomValidity('هذا البريد مسجل مسبقًا. فضلًا قم بتسجيل الدخول');
                        document.getElementById('email').reportValidity();
                        emailExist = true;
                        return;
                    }

                }).then((res) => {
                    if (!emailExist) {
                        //console.log(res.user);
                        $rootScope.auth = true;
                        db.collection('Users').add({
                            name: $scope.name,
                            //userId: auth.currentUser.uid
                        }).then(() => {//success
                            console.log("Name successfully added");
                        }).catch(err => {//failure
                            console.log(err.message);

                        })

                        $rootScope.$apply(function () {
                            $location.path("/home");
                            console.log("location path exec" + $location.path());
                        });
                    }
                })
        }
    }
});

app.controller('loginCtrl', function ($scope, $location, $rootScope) {

    $rootScope.auth = false;
    console.log("entered loginCtrl");
    $scope.login = function () {

        if (validateLoginForm()) {
            console.log('entered if validate login')
            auth.signInWithEmailAndPassword($scope.email, $scope.password)
                .then(function (firebaseUser) {
                    // Success 
                    $rootScope.auth = true;
                    $rootScope.$apply(function () {
                        $location.path("/home");
                        console.log("location path exec" + $location.path());
                    });
                })
                .catch(function (error) {
                    // Error Handling
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    if (errorCode === 'auth/wrong-password') {
                        document.getElementById('loginPassword').setCustomValidity('فضلًا تأكد من صحة كلمة المرور');
                        document.getElementById('loginPassword').reportValidity();
                        //emailExist = true;
                        return;
                    } else if (errorCode === 'auth/user-not-found') {
                        document.getElementById('loginEmail').setCustomValidity('البريد غير مسجل مسبقًا. فضلًا قم بإنشاء حساب جديد');
                        document.getElementById('loginEmail').reportValidity();
                        //emailExist = true;
                        return;
                    } else {
                        console.log(errorCode + errorMessage);
                    }

                });
        }
    }
})

app.controller('resetCtrl', function ($scope) {

    $scope.reset = function () {
        if (validateResetEmail()) {
            auth.sendPasswordResetEmail($scope.resetEmail)
                .then(function () {
                    console.log('email sent')
                    document.getElementById('resetMessage').innerHTML = 'تم إرسال رابط استعادة كلمة المرور. فضلًا قم بمراجعة بريدك الإلكتروني ';
                })
                .catch(function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode === 'auth/user-not-found') {
                        console.log(errorCode + " " + errorMessage);
                        document.getElementById('resetEmail').setCustomValidity('هذا البريد غير مسجل مسبقًا. فضلًا قم بإنشاء حساب جديد');
                        document.getElementById('resetEmail').reportValidity();
                    }
                    else {
                        console.log(error);
                        document.getElementById('resetMessage').innerHTML = errorCode + " " + errorMessage;
                    }

                })
        }
    }

})

app.controller('homeCtrl', function ($scope, $location, $rootScope) {
    $scope.logout = function () {
        console.log('logout function')
        auth.signOut().then(function () {
            $rootScope.auth = false;
            console.log('Signed Out');
            $rootScope.$apply(function () {
                $location.path("/");
            });
        }, function (error) {
            console.error('Sign Out Error', error);
        });
    }

})

app.controller('uploadCtrl', function ($scope, $location, $rootScope) {
    $scope.logout = function () {
        console.log('logout function')
        auth.signOut().then(function () {
            $rootScope.auth = false;
            console.log('Signed Out');
            $rootScope.$apply(function () {
                $location.path("/");
            });
        }, function (error) {
            console.error('Sign Out Error', error);
        });
    }

    console.log('uploadCtrl');

    const remote = require('@electron/remote')
    const remoteMain = remote.require("@electron/remote/main");
    const { path } = require('path');

    // Importing dialog module using remote
    const { dialog1 } = remote.dialog;

    var uploadFile = document.getElementById('upload');

    // Defining a Global file path Variable to store
    // user-selected file
    global.filepath = undefined;

    uploadFile.addEventListener('click', () => {
        // to send file path to python script
        const { PythonShell } = require('python-shell');
        let pyshell = new PythonShell('preprocessing.py');

        // If the platform is 'win32' or 'Linux'
        if (process.platform !== 'darwin') {
            // Resolves to a Promise<Object>
            remote.dialog.showOpenDialog({
                properties: ['openFile'],
                title: 'قم باختيار الملف الذي ترغب في تحميله',
                //defaultPath: path.join(__dirname, '../assets/'),
                buttonLabel: 'تحميل',
                // Restricting the user to only txt and csv Files.
                filters: [
                    {
                        name: 'Text Files',
                        extensions: ['csv']
                    },],
            }).then(file => {
                console.log(file.canceled);
                if (!file.canceled) {
                    // Updating the GLOBAL filepath variable to user-selected file.
                    global.filepath = file.filePaths[0].toString();
                    console.log(global.filepath);
                    // print file path on upload page
                    document.getElementById('fileName').innerHTML = global.filepath;
                    // send file path
                    pyshell.send(JSON.stringify([global.filepath]))
                    $rootScope.$apply(function () {
                        $location.path("/waiting");
                    });
                    pyshell.on('message', function (message) {
                        console.log(message + 'back to the python shell');
                        $rootScope.projectId = message;
                    })

                    pyshell.end(function (err) {
                        if (err) {
                            throw err;
                        };
                        console.log('finished');
                        //console.log(projectId)
                        $rootScope.$apply(function () {
                            $location.path("/projectName");
                        });
                    });
                }
            }).catch(err => {
                console.log(err)
            });
        }
        else {
            // If the platform is 'darwin' (macOS)
            remote.dialog.showOpenDialog({
                title: 'قم باختيار الملف الذي ترغب في تحميله',
                //	defaultPath: path.join(__dirname, '../VSCode/'),
                buttonLabel: 'تحميل',
                filters: [
                    {
                        name: 'Text Files',
                        extensions: ['csv']
                    },],
                // Specifying the File Selector and Directory
                // Selector Property In macOS
                properties: ['openFile', 'openDirectory']
            }).then(file => {
                console.log(file.canceled);
                if (!file.canceled) {
                    global.filepath = file.filePaths[0].toString();
                    console.log(global.filepath);
                    document.getElementById('fileName').innerHTML = global.filepath;

                    // send file path
                    pyshell.send(JSON.stringify([global.filepath]))
                    $rootScope.$apply(function () {
                        $location.path("/waiting");
                    });
                    pyshell.on('message', function (message) {
                        console.log(message);
                        $rootScope.projectId = message;
                    })

                    pyshell.end(function (err) {
                        if (err) {
                            throw err;
                        };
                        console.log('finished');
                        //location.href = "#!/history";
                        $rootScope.$apply(function () {
                            $location.path("/projectName");
                        });
                    });
                }
            }).catch(err => {
                console.log(err)
            });
        }
    });




})

app.controller('projectNameCtrl', function ($scope, $location, $rootScope) {
    console.log('enter project Name ctrl')
    $scope.submitName = function () {
        if (validateProjectName()) {
            db.collection("projects").doc($rootScope.projectId).update({ name: $scope.projectName, userId: auth.currentUser.uid });
            console.log('name updated')

            $location.path("/visualizations");
        }
    }
})

app.controller('historyCtrl', function ($scope, $location, $rootScope, $compile) {

    $scope.logout = function () {
        console.log('logout function')
        auth.signOut().then(function () {
            $rootScope.auth = false;
            console.log('Signed Out');
            $rootScope.$apply(function () {
                $location.path("/");
            });
        }, function (error) {
            console.error('Sign Out Error', error);
        });
    }


    var script = document.createElement('script');
    script.onload = function () {
        //do stuff with the script
        var script2 = document.createElement('script');
        script.onload = function () {
            //do stuff with the script
        };

        script2.src = "https://cdn.jsdelivr.net/npm/moment-hijri@2.0.1/moment-hijri.js";

        document.head.appendChild(script2);

    };
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js";

    document.head.appendChild(script);

    $scope.openProject = function (projectId) {
        console.log('open Project function')
        console.log(projectId)

        $rootScope.projectId = projectId;
        $rootScope.$apply(function () {
            $location.path("/visualizations");
        });
    }

    console.log('enter history Ctrl !!')
    db.collection("projects").where("userId", "==", auth.currentUser.uid)
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                let data = doc.data();
                let date = data.date.toDate();
                let hijriDate = date.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                var projectId = data.projectId
                let row = `<tr>
                            <td style=\"font-family:Cairo; text-decoration-line: underline\"><h5 id=\"${projectId}\"  
                            onclick=\"angular.element(this).scope().openProject('${data.projectId}')\" >${data.name}</h5></td>
                            <td style=\"font-family:Cairo\">${hijriDate}</td>
                            <td style=\"font-family:Cairo; text-decoration-line: underline\"> <a id=\"deleteLink\" 
                            href="javascript:deleteProject('${data.projectId}')\">حذف</a></td>
                      </tr>`;
                let table = document.getElementById('dataTableBody')
                table.innerHTML += row
            })
        })
        .catch(err => {
            console.log(`Error: ${err}`)
        });
})

app.controller('resultsCtrl', function ($scope, $location, $rootScope) {

    $scope.logout = function () {
        console.log('logout function')
        auth.signOut().then(function () {
            $rootScope.auth = false;
            console.log('Signed Out');
            $rootScope.$apply(function () {
                $location.path("/");
            });
        }, function (error) {
            console.error('Sign Out Error', error);
        });
    }

    console.log('enter visulization Ctrl !!')
    console.log('from result Ctrl:' + $rootScope.projectId)
    db.collection("projects").doc($rootScope.projectId)
        .get()
        .then(doc => {
            let data = doc.data();

            let positives = document.getElementById('positives')
            let negatives = document.getElementById('negatives')
            let general = document.getElementById('general')
            let pieChart = document.getElementById('pieChart')
            let commonWords = document.getElementById('commonWords')
            let projectName = document.getElementById('projectNameVisualization')

            projectName.innerHTML = data.name
            positives.innerHTML = data.positives
            negatives.innerHTML = data.negatives
            general.innerHTML = data.general
            pieChart.innerHTML = '<img class=\"centered-and-cropped\" src=\"' + data.pieChart + '\"/>'
            commonWords.innerHTML = '<img style=\"width: 480px; height: 370px\" src=\"' + data.commonWords + '\"/>'

            console.log('visualization complete')
        })

        .catch(err => {
            console.log(`Error: ${err}`)
        });

})

app.controller('classifiedCtrl', function ($scope, $location, $rootScope) {
    $scope.logout = function () {
        console.log('logout function')
        auth.signOut().then(function () {
            $rootScope.auth = false;
            console.log('Signed Out');
            $rootScope.$apply(function () {
                $location.path("/");
            });
        }, function (error) {
            console.error('Sign Out Error', error);
        });
    }

    console.log('enter classified Ctrl !!')
    console.log('from result Ctrl:' + $rootScope.projectId)
    db.collection("projects").doc($rootScope.projectId)
        .get()
        .then(doc => {
            let data = doc.data();
            let filePath = data.tweets
            console.log(filePath)

            let section = document.getElementById('classifiedTweets')
            let projectName = document.getElementById('projectNameClassified')

            projectName.innerHTML = data.name


            const csv = require('csv-parser');
            const got = require('got');
            got.stream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    //console.log(row);
                    // console.log(row['Tweet Content'])
                    var keys = Object.keys(row);
                    //console.log(keys[0]);

                    if (row.Label == 'positive') {
                        tweet = `<div class=\"course\">
                    <div class=\"course-info\">
                        <div class=\"content-box-blue\" >
                 <label id=\"orderNo\"> <i class=\"far fa-calendar\"></i>${row[keys[2]]}</label>                  
                            <span class=\"labelP success\">إيجابي</span>
                            <p class=\"tweetC\">${row[keys[22]]} </p>
                            <hr>  
                               <p><a  href=\"${row[keys[1]]}\">
                                ${row[keys[1]]} 
                            </a> <i class=\"fas fa-paperclip\"></i>
                               </p>
                        </div>
                            </div>
                    
                </div>`
                    } else {
                        tweet = `<div class="course">
                <div class="course-info">
                    <div class="content-box-blue" >
                         <label id="orderNo"> <i class="far fa-calendar"></i>${row[keys[2]]}</label>  
                         <span class="labelG NigativeL">سلبي </span>
                        <p class="tweetC"> ${row[keys[22]]}</p>
                        <hr>  
                        <p><a  href=\"${row[keys[1]]}\">
                        ${row[keys[1]]}                             
                        </a> <i class="fas fa-paperclip"></i>
                           </p>
                    </div>
                        </div>
                
            </div>`

                    }

                    section.innerHTML += tweet
                    //console.log('display classified completed')

                })
                .on('end', () => {
                    console.log('CSV file successfully processed');
                });


        })

        .catch(err => {
            console.log(`Error: ${err}`)
        });

})



function validateSignupForm() {
    console.log('enter validate function')
    var email = document.getElementById('email');
    var name = document.getElementById('name');
    var password = document.getElementById('password');
    var confPass = document.getElementById('confPass');

    var nameRegex = new RegExp("^[a-zA-Z\u0600-\u06FF,-][\sa-zA-Z\u0600-\u06FF,-]*$");
    if (name.value == null || name.value == "") {
        console.log('enter null if')
        name.setCustomValidity('فضلًا قم بإدخال اسمك')
        name.reportValidity();
        return false;
    }
    if (!nameRegex.test(name.value)) {
        console.log('enter if statement')
        name.setCustomValidity('فضلًا قم بإدخال الأحرف العربية أو الإنجليزية فقط');
        name.reportValidity();
        return false;
    }

    var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email.value == null || email.value == "") {
        console.log('enter null if')
        email.setCustomValidity('فضلًا قم بإدخال البريد الإلكتروني')
        email.reportValidity();
        return false;
    }
    if (!email.value.match(emailRegex)) {
        console.log('enter if statement')
        email.setCustomValidity('فضلًا قم بإدخال بريد إلكتروني صحيح');
        email.reportValidity();
        return false;
    }

    //validate password
    var passRegex = new RegExp("^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
    if (password.value == null || password.value == "") {
        console.log('enter null if')
        password.setCustomValidity('فضلًا قم بإدخال كلمة المرور')
        password.reportValidity();
        return false;
    }
    if (!passRegex.test(password.value)) {
        console.log('enter if statement')
        password.setCustomValidity(' كلمة المرور يجب أن تكون ثمانية أحرف على الأقل وأن تحتوي على أرقام ورموز ');
        password.reportValidity();
        return false;
    }

    //validate repeated password
    if (confPass.value == null || confPass.value == "") {
        console.log('enter null if')
        confPass.setCustomValidity('فضلًا قم بتأكيد كلمة المرور')
        confPass.reportValidity();
        return false;
    }
    if (confPass.value != password.value) {
        console.log('enter if statement')
        confPass.setCustomValidity('فضلًا تأكد من مطابقة كلمة المرور');
        confPass.reportValidity();
        return false;
    }
    return true;
}

function validateLoginForm() {
    console.log('enter login validate function')
    var email = document.getElementById('loginEmail');
    var password = document.getElementById('loginPassword');

    var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email.value == null || email.value == "") {
        console.log('enter null if')
        email.setCustomValidity('فضلًا قم بإدخال البريد الإلكتروني')
        email.reportValidity();
        return false;
    }
    if (!email.value.match(emailRegex)) {
        console.log('enter if statement')
        email.setCustomValidity('فضلًا قم بإدخال بريد إلكتروني صحيح');
        email.reportValidity();
        return false;
    }

    //validate password
    //var passRegex = new RegExp("^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
    if (password.value == null || password.value == "") {
        console.log('enter null if')
        password.setCustomValidity('فضلًا قم بإدخال كلمة المرور')
        password.reportValidity();
        return false;
    }
    /*if (!passRegex.test(password.value)) {
        console.log('enter if statement')
        password.setCustomValidity(' كلمة المرور يجب أن تكون ثمانية أحرف على الأقل وأن تحتوي على أرقام ورموز ');
        password.reportValidity();
        return false;
    }*/
    return true;
}

function validateResetEmail() {
    console.log('enter reset validate function')
    var email = document.getElementById('resetEmail');

    // validate reset Email
    var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email.value == null || email.value == "") {
        console.log('enter null if')
        email.setCustomValidity('فضلًا قم بإدخال البريد الإلكتروني')
        email.reportValidity();
        return false;
    }
    if (!email.value.match(emailRegex)) {
        console.log('enter if statement')
        email.setCustomValidity('فضلًا قم بإدخال بريد إلكتروني صحيح');
        email.reportValidity();
        return false;
    }
    return true;
}

function validateProjectName() {
    var projectName = document.getElementById('projectName');

    var nameRegex = new RegExp("^[a-zA-Z\u0600-\u06FF,-][\sa-zA-Z\u0600-\u06FF,-]*$");
    if (projectName.value == null || projectName.value == "") {
        console.log('enter null if')
        projectName.setCustomValidity('فضلًا قم بإدخال اسم العمل')
        projectName.reportValidity();
        return false;
    }
    if (!nameRegex.test(projectName.value)) {
        console.log('enter if statement')
        projectName.setCustomValidity('فضلًا قم بإدخال الأحرف العربية أو الإنجليزية فقط');
        projectName.reportValidity();
        return false;
    }

    return true;

}

function deleteProject(projectId) {
    console.log('delete project function');
    //alert('هل أنت متأكد من أنك تريد حذف هذا العمل؟')
    if (confirm("هل أنت متأكد من أنك تريد حذف هذا العمل؟") == true) {
        var query = db.collection('projects').where('projectId', '==', projectId);
        query.get().then(function (querySnapshot) {
            querySnapshot.forEach(async function (doc) {
                await doc.ref.delete();

                var history = document.getElementById('dataTableBody')
                history.innerHTML = ""

                db.collection("projects").where("userId", "==", auth.currentUser.uid)
                    .get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            let data = doc.data();
                            let date = data.date.toDate();
                            let hijriDate = date.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                            let row = `<tr>
                            <td style=\"font-family:Cairo; text-decoration-line: underline\"><h5 id=\"${projectId}\"  
                            onclick=\"angular.element(this).scope().openProject('${data.projectId}')\" >${data.name}</h5></td>
                            <td style=\"font-family:Cairo\">${hijriDate}</td>
                            <td style=\"font-family:Cairo; text-decoration-line: underline\"> <a id=\"deleteLink\" 
                            href=\"javascript:deleteProject('${data.projectId}')\">حذف<a></td>
                      </tr>`;

                            history.innerHTML += row;
                        })
                    })
                    .catch(err => {
                        console.log(`Error: ${err}`)
                    });
            });
        });
    } else {
        console.log('user canceled')
    }

}

async function checkAlreadyLoggedIn(fbConfig) {
    try {
        // initializeApp must be called before any other Firebase APIs
        //firebase.initializeApp( fbConfig )

        // a signout request may be passed in the browser querystring
        await checkForSignout()

        // whether or not the user is forced to log in every time
        await setUserPersistence(getTrueQueryParam("persistentUser"))

        // we must make a decision: if there is a persistent user then do not start the login workflow
        const foundUser = await checkForPersistentUser()
        if (!foundUser) {
            throw ("NO USER")
        }

        // we found a user defined in the IndexedDB object store, so wait for the login
        firebase.auth().onAuthStateChanged(postAuthResult)
    }
    catch (error) {
        // no persisted user or some errr, so start the login UI workflow from firebaseUI
        const response = await showLoginWindow()
        firebaseAuthUIStart(fbConfig, idpConfig)
    }
}
