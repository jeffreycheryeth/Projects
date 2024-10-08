document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit handler
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function viewEmail(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-detail-view').style.display = 'block';
    // ... do something else with email ...
    document.querySelector('#email-detail-view').innerHTML = `
    <ul class="list-group">
    <li class="list-group-item">From: ${email.sender}</li>
    <li class="list-group-item">To: ${email.recipients}</li>
    <li class="list-group-item">Subject: ${email.subject}</li>
    <li class="list-group-item">Timestamp: ${email.timestamp}</li>
    <li class="list-group-item">${email.body}</li>
    </ul>
    `
    //change to read
    if (!email.read){
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }

    //Archive/unArchive logic
          const element = document.createElement('button');
      element.innerHTML = email.archived ? "Unarchive" : "Archive";
      element.className = email.archived ? "btn btn-danger" : "btn btn-success";
      element.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archive: !email.archived
          })
        })
        .then(()=>{
          load_mailbox('archive')
        });
      });
      document.querySelector('#email-detail-view').append(element);

      //btn reply
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply";
      btn_reply.className = 'btn btn-info px-2';
      btn_reply.addEventListener('click', function() {
        compose_email();
        document.querySelector('#compose-recipients').value = email.sender;
        let subject = email.subject;
        if (subject.split(' ',1)[0] != "Re:"){
          subject = "Re:" + email.subject
        }
        document.querySelector('#compose-subject').value = '';
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      });
      document.querySelector('#email-detail-view').append(btn_reply);
});
}
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //Get emails for that mailbox and user
    fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      //loop through email and create a div for each email
      emails.forEach(singleEmail =>{
        const newEmail = document.createElement('div');
        newEmail.className = "list-group-item";
        newEmail.innerHTML = `
          <h5>Sender: ${singleEmail.sender}</h7 <br>
          <h7>Subject: ${singleEmail.subject}</h7>
          <p>Sent On: ${singleEmail.timestamp}</p>
        `;
        //change background color
        
        newEmail.className = singleEmail.read ? 'read': 'unread';
        //Add click event to view email
       newEmail.addEventListener('click', viewEmail(singleEmail.id));
        document.querySelector('#emails-view').append(newEmail);
        })
  });
}

function send_email(event){
  event.preventDefault();
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send data to backend
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });

}
