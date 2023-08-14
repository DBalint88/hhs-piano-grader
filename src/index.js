import { initializeApp } from 'firebase/app'
import { 
    getFirestore, collection, getDocs, doc, onSnapshot,
    query, where, orderBy, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'

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

let submissions = []
const q = query(subsRef, where("resolved", "==", false), orderBy('lastName', 'desc'), orderBy('timeStamp', 'asc'))
onSnapshot(q, (snapshot) => {
    submissions = []
    snapshot.docs.forEach((submission) => {
        submissions.push({ ...submission.data(), id: submission.id })
    })
    buildList()
    console.log(submissions)
})



const unresolvedRecordWrapper = document.getElementById("unresolved-record-wrapper")

function buildList() {


    while (unresolvedRecordWrapper.children.length > 1) {
        unresolvedRecordWrapper.removeChild(unresolvedRecordWrapper.lastChild)
    }

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

        updateDoc(subRef, {
            resolved: true,
            result: "pass",
            fbTimeStamp: serverTimestamp()
        })
    }

    if (value == "fail") {
        if (!failedSongs.includes(songID)) {
            failedSongs.push(songID)
        }
        updateDoc(subRef, {
            resolved: true,
            result: "fail",
            fbTimeStamp: serverTimestamp()
        })
        
    }

    updateDoc(userRef, {
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