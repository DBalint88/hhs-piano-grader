import { initializeApp } from 'firebase/app'
import { 
    getFirestore, collection, getDocs, doc, onSnapshot,
    query, where, orderBy, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { 
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged

} from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyC61HybpprKggSz0hCpkVWXDdCv7SyXHHo",
    authDomain: "hhs-piano-page.firebaseapp.com",
    projectId: "hhs-piano-page",
    storageBucket: "hhs-piano-page.appspot.com",
    messagingSenderId: "324874631780",
    appId: "1:324874631780:web:920145268e3c34c16a7d71"
};



initializeApp(firebaseConfig)
const db = getFirestore()
const subsRef = collection(db, 'submissions')
const auth = getAuth()
const provider = new GoogleAuthProvider();
const loginButton = document.getElementById("login-button")
const userID = ""

loginButton.addEventListener('click', () => {
    signInWithPopup(auth, provider)
})

let submissions = []
let resolved = []

const startDate = new Date('January 28, 2024')
const todaysDate = new Date()
const currentWeek = Math.ceil((todaysDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24 * 7))

function queryDatabase() {
    // If it's Balint, query by instructor == "balint"
    if (userID == 'BJgwfUL5JHNjMed0L9HDJvuiNiw1') {
        const q = query(subsRef, where("resolved", "==", false), where("instructor", "==", "balint"), orderBy('lastName', 'desc'), orderBy('timeStamp', 'asc'))
        const z = query(subsRef, where("resolved", "==", true), where("instructor", "==", "balint"), where("week", ">=", (currentWeek-1)), orderBy("week", "desc"), orderBy('fbTimeStamp', 'desc'))
    }

    // If it's Rossomando, query by instructor == "rossomando"
    if (userID == 'nwCAcnG387bHMxCCAPDTDsP0vp72') {
        const q = query(subsRef, where("resolved", "==", false), where("instructor", "==", "rossomando"), orderBy('lastName', 'desc'), orderBy('timeStamp', 'asc'))
        const z = query(subsRef, where("resolved", "==", true), where("instructor", "==", "rossomando"), where("week", ">=", (currentWeek-1)), orderBy("week", "desc"), orderBy('fbTimeStamp', 'desc'))
    }
}



const unresolvedRecordWrapper = document.getElementById("unresolved-record-wrapper")
const resolvedRecordWrapper = document.getElementById("resolved-record-wrapper")


onAuthStateChanged(auth, async (user) => {
    // Logic for when the user logs in. If succesful and profile exists, get userLevel & song arrays 
    if (user) {
      loginButton.style.display = 'none'  
      userID = user.uid 
      queryDatabase()
  
      try {
        
        onSnapshot(q, (snapshot) => {

            // reset local data & DOM
            submissions = []
            while (unresolvedRecordWrapper.children.length > 1) {
                unresolvedRecordWrapper.removeChild(unresolvedRecordWrapper.lastChild)
            }
        
            snapshot.docs.forEach((submission) => {
                submissions.push({ ...submission.data(), id: submission.id })
            })
        
            buildActiveList()
        })
        
        onSnapshot(z, (snapshot) => {
            resolved = []
            while (resolvedRecordWrapper.children.length > 1) {
                resolvedRecordWrapper.removeChild(resolvedRecordWrapper.lastChild)
            }
            snapshot.docs.forEach((resolvedSub) => {
                resolved.push({ ...resolvedSub.data({ serverTimestamps: 'estimate' }), id: resolvedSub.id })
            })
            buildResolvedList()
        })
        
      }
      catch(error) {
        console.log(error)
      }
      
    } else {
      console.log('no user logged in')
      loginButton.style.display = 'block'
    }
});








function buildActiveList() {

    for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i];

        let record = document.createElement('tr')

        let timeStamp = document.createElement('td')
        timeStamp.textContent = sub.timeStamp.toDate().toLocaleDateString('en-us', { weekday: "short", month: "short", day: "numeric"  })
        timeStamp.classList.add("center-align")

        let week = document.createElement('td')
        week.textContent = sub.week
        week.classList.add("center-align")

        let lastName = document.createElement('td')
        lastName.textContent = sub.lastName
        lastName.classList.add("left-align")

        let firstName = document.createElement('td')
        firstName.textContent = sub.firstName
        firstName.classList.add("left-align")

        let songLevel = document.createElement('td')
        songLevel.textContent = sub.songLevel
        songLevel.classList.add("center-align")

        let songSeq = document.createElement('td')
        songSeq.textContent = sub.songSeq
        songSeq.classList.add("center-align")

        let songTitle = document.createElement('td')
        songTitle.textContent = sub.songTitle
        songTitle.classList.add("center-align")
        
        let pointValue = document.createElement('td')
        pointValue.textContent = sub.pointValue
        pointValue.classList.add("center-align")

        let gradeFormCell = document.createElement('td')
        gradeFormCell.classList.add("center-align")
        let gradeForm = document.createElement('form')

        let formLabelPass = document.createElement('label')
        formLabelPass.setAttribute("for", "pass")
        formLabelPass.textContent = "Pass"
        let formInputPass = document.createElement('input')
        formInputPass.setAttribute("type", "radio")
        formInputPass.setAttribute("name", "passfail")
        formInputPass.setAttribute("value", "pass")
        formInputPass.required = true

        let formLabelFail = document.createElement('label')
        formLabelFail.setAttribute("for", "fail")
        formLabelFail.textContent = "Fail"
        let formInputFail = document.createElement('input')
        formInputFail.setAttribute("type", "radio")
        formInputFail.setAttribute("name", "passfail")
        formInputFail.setAttribute("value", "fail")

        let formButton = document.createElement('button')
        formButton.textContent = "Confirm"
        gradeForm.addEventListener("submit", (event) => {
            event.preventDefault();
            processFeedback(event, sub.id, sub.songfbRef, sub.userID, gradeForm.passfail.value)
        })

        gradeFormCell.appendChild(gradeForm)
        
        gradeForm.appendChild(formInputPass)
        gradeForm.appendChild(formLabelPass)
        
        gradeForm.appendChild(formInputFail)
        gradeForm.appendChild(formLabelFail)
        
        gradeForm.appendChild(formButton)



        unresolvedRecordWrapper.appendChild(record)
        record.appendChild(timeStamp)
        record.appendChild(week)
        record.appendChild(lastName)
        record.appendChild(firstName)
        record.appendChild(songLevel)
        record.appendChild(songSeq)
        record.appendChild(songTitle)
        record.appendChild(pointValue)
        record.appendChild(gradeFormCell)
    }
}

async function buildResolvedList() {

    for (let i = 0; i < resolved.length; i++) {
        
        const sub = resolved[i];

        let record = document.createElement('tr')

        let timeStamp = document.createElement('td')
        timeStamp.textContent = sub.timeStamp.toDate().toLocaleDateString('en-us', { weekday: "short", month: "short", day: "numeric" })
        timeStamp.classList.add("center-align")

        let resolvedTimeStamp = document.createElement('td')
        resolvedTimeStamp.textContent = sub.fbTimeStamp.toDate().toLocaleDateString('en-us', { weekday: "short", month: "short", day: "numeric" })
        resolvedTimeStamp.classList.add("center-align")

        let result = document.createElement('td')
        result.textContent = sub.result.toUpperCase()
        if (sub.result == 'pass') {
            result.style.backgroundColor = 'darkgreen'
        } else if (sub.result == 'fail') {
            result.style.backgroundColor = 'darkred'
        }
        result.classList.add("center-align")

        let week = document.createElement('td')
        week.textContent = sub.week
        week.classList.add("center-align")

        let lastName = document.createElement('td')
        lastName.textContent = sub.lastName
        lastName.classList.add("left-align")

        let firstName = document.createElement('td')
        firstName.textContent = sub.firstName
        firstName.classList.add("left-align")

        let songLevel = document.createElement('td')
        songLevel.textContent = sub.songLevel
        songLevel.classList.add("center-align")

        let songSeq = document.createElement('td')
        songSeq.textContent = sub.songSeq
        songSeq.classList.add("center-align")

        let songTitle = document.createElement('td')
        songTitle.textContent = sub.songTitle
        songTitle.classList.add("center-align")
        
        let pointValue = document.createElement('td')
        pointValue.textContent = sub.pointValue
        pointValue.classList.add("center-align")

        let gradeFormCell = document.createElement('td')
        gradeFormCell.classList.add("center-align")
        let gradeForm = document.createElement('form')

        let undoButton = document.createElement('button')
        undoButton.textContent = "Undo"
        undoButton.addEventListener("click", (event) => {
            event.preventDefault()
            undoFeedback(sub.id, sub.songfbRef, sub.userID, sub.result)
        })

        gradeForm.appendChild(undoButton)
        gradeFormCell.appendChild(gradeForm)


        resolvedRecordWrapper.appendChild(record)
        record.appendChild(timeStamp)
        record.appendChild(resolvedTimeStamp)
        record.appendChild(result)
        record.appendChild(week)
        record.appendChild(lastName)
        record.appendChild(firstName)
        record.appendChild(songLevel)
        record.appendChild(songSeq)
        record.appendChild(songTitle)
        record.appendChild(pointValue)
        record.appendChild(gradeFormCell)
    }
}

async function undoFeedback(subID, songID, userID, result) {
    // Undo function is tricky.  It needs to "know" what happened to each record to undo it.  Separate parameter?
    // Basically, if the song was Failed, it needs to be un-failed.  Pull down failedSongs, remove this one, re-upload.
    // Also, update the submission status "resolved" = false
    // If the song was Passed, it needs to be un-passed.  Pull down completedSongs, remove this one, re-upload.
    // In either case, the songID needs to be added back to pendingSongs.
    // ...AND, the fbTimeStamp field needs to be cleared.
    // What if a song was previously failed, you marked it completed, and now undo that?  The failure status is lost.
    // I could query all submissions for the songID and failure status.  
    // Does it really matter?  It seems like such a corner case.  If I undo feedback, I'm going to immediately re-do it.
    // In fact, I think it's a non-issue.  Or an even smaller corner than I thought.
    // I would have to undo the feedback, then they would immediately have to unsubmit the song.  
    // That's a really unlikely situation, and ultimately inconsequential.

    const userRef = doc(db, 'userProfiles', userID)
    const subRef = doc(db, 'submissions', subID)
    let docSnap = await getDoc(userRef)
    let pendingSongs = docSnap.get("pendingSongs")
    let completedSongs = docSnap.get("completedSongs")
    let failedSongs = docSnap.get("failedSongs")
    pendingSongs.push(songID)
    if (result == 'pass') {
        completedSongs.splice(completedSongs.indexOf(songID), 1)
    }
    if (result == 'fail') {
        failedSongs.splice(failedSongs.indexOf(songID), 1)
    }
    await updateDoc(userRef, {
        pendingSongs: pendingSongs,
        failedSongs: failedSongs,
        completedSongs: completedSongs
    })
    await updateDoc(subRef, {
        resolved: false,
        result: ''
    })
}
async function processFeedback(event, subID, songID, userID, value) {
    
    console.log(subID)
    console.log(songID)
    console.log(userID)
    console.log(value)
    

    // this function needs to take in a few arguments: userID, subID, songID, form value.

    // this function splits into two paths based on the value of the form, pass or fail.

    // if Pass:
        // Pull down the failedSongs, pendingSongs, and completedSongs arrays for the given user.
        // Remove the fbRef number from failedSongs & pendingSongs, add it to completedsongs
        // Upload the updated arrays to the DB.
        // Update the "resolvedTimeStamp" field in the DB
        // Update the "resolved" field in the DB
    const userRef = doc(db, 'userProfiles', userID)
    const subRef = doc(db, 'submissions', subID)
    let docSnap = await getDoc(userRef);
    let pendingSongs = docSnap.get("pendingSongs")
    let completedSongs = docSnap.get("completedSongs")
    let failedSongs = docSnap.get("failedSongs")
    pendingSongs.splice(pendingSongs.indexOf(songID), 1)
    if (value == "pass") {
        if (failedSongs.includes(songID)) {
            failedSongs.splice(failedSongs.indexOf(songID), 1)
        }
        completedSongs.push(songID)

        await updateDoc(subRef, {
            resolved: true,
            result: "pass",
            fbTimeStamp: serverTimestamp()
        })
    }

    if (value == "fail") {
        if (!failedSongs.includes(songID)) {
            failedSongs.push(songID)
        }
        await updateDoc(subRef, {
            resolved: true,
            result: "fail",
            fbTimeStamp: serverTimestamp()
        })
        
    }

    await updateDoc(userRef, {
        pendingSongs: pendingSongs,
        failedSongs: failedSongs,
        completedSongs: completedSongs
    })
    // if Fail:
        // Pull down the failedSongs and pendingSongs arrays for the given user
        // remove the fbRef number from pendingSongs, add it to failedSongs IF it doesn't already exist there!
        // Upload the updated arrays to the DB
        // Update the "resolvedTimeStamp" field in the DB
        // Update the "resolved" field in the DB
}