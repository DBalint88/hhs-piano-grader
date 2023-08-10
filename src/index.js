import { initializeApp } from 'firebase/app'
import { 
    getFirestore, collection, getDocs, doc, onSnapshot,
    query, where, orderBy
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
const usersRef = collection(db, 'userProfiles')
const subsRef = collection(db, 'submissions')

let submissions = []
const q = query(subsRef, where("resolved", "==", false), orderBy('lastName', 'desc'), orderBy('timeStamp', 'desc'))
onSnapshot(q, (snapshot) => {
    snapshot.docs.forEach((submission) => {
        submissions.push({ ...submission.data(), id: submission.id })
    })
    buildList()
    console.log(submissions)
})

const recordWrapper = document.getElementById("record-wrapper")

function buildList() {
    for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i];
        let record = document.createElement('tr')

        let timeStamp = document.createElement('td')
        timeStamp.textContent = sub.timeStamp.toDate()

        let week = document.createElement('td')
        week.textContent = sub.week

        let lastName = document.createElement('td')
        lastName.textContent = sub.lastName

        let firstName = document.createElement('td')
        firstName.textContent = sub.firstName

        let songLevel = document.createElement('td')
        songLevel.textContent = sub.songLevel

        let songSeq = document.createElement('td')
        songSeq.textContent = sub.songSeq

        let songTitle = document.createElement('td')
        songTitle.textContent = sub.songTitle
        
        let pointValue = document.createElement('td')
        pointValue.textContent = sub.pointValue

        recordWrapper.appendChild(record)
        record.appendChild(timeStamp)
        record.appendChild(week)
        record.appendChild(lastName)
        record.appendChild(firstName)
        record.appendChild(songLevel)
        record.appendChild(songSeq)
        record.appendChild(songTitle)
        record.appendChild(pointValue)

        
        
        
    }
}
