document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#error').style.display='none';
  
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  

  document.querySelector("#compose-form").onsubmit = function () {

     const recipients=document.querySelector('#compose-recipients').value;
     const subject=document.querySelector('#compose-subject').value;
     const body=document.querySelector('#compose-body').value;


     fetch('/emails',{
        method: 'POST',
        body: JSON.stringify({
           recipients: recipients,
           subject: subject,
           body: body})
     })
     .then(response => response.json())
     .then(result => {
         if(result.error)
         {
          const err=document.querySelector('#error');
          document.querySelector('#error-msg').innerHTML=result.error;
          err.style.display='block';
          compose_email();
         }
         else {
           load_mailbox('sent');
         }
     });
      return false;
  }
    

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email(event, subject='',body='',recipients='') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display='none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;

  if(body.length===0)
  {
   document.querySelector('#compose-recipients').focus();
  }
  else
  {
   document.querySelector('#compose-body').focus();
  }
  return false;
}



function load_mailbox(mailbox) {

  // Show the mailbox and hide other views

  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display='none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<div class="text-center mt-2">
                                                        <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
                                                        <hr></div>`;

 
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => 
       emails.forEach(email => {
         console.log(email.archived,mailbox)
         if(mailbox!='inbox'||!email.archived)
         {
         
          const div = document.createElement('div');
          div.className='row mail';

          div.innerHTML = `<div class="col-4 pt-2">
                              <p>${email.sender}</p>
                           </div>
                           <div class="col-4 pt-2 text-center">
                              <p>${email.subject}</p>
                           </div>
                           <div class="col-4 pt-2">
                              <p style="float: right">${email.timestamp}</p>
                           </div>`;


          div.addEventListener('click', () => {
              if(!email.read)
              {
               fetch(`/emails/${email.id}`,{
                  method: 'PUT',
                  body: JSON.stringify({
                     read: true
                  })
               })
               .then(response => response.json())
               .then(result => console.log(result));
                  
              }
              email_view(email, mailbox);     
          });


          div.style.backgroundColor="white";
          div.style.fontWeight="bold";
          
          if(email.read)
          {
             div.style.backgroundColor="#F5F5F5";
             div.style.fontWeight="normal";
          }


         
         document.querySelector('#emails-view').append(div);
         }
       })
     )
     return false;

}

function email_view(email, mailbox)
{
   document.querySelector('#compose-view').style.display = 'none';
   document.querySelector('#emails-view').style.display = 'none';
   document.querySelector('#email').innerHTML='';
   document.querySelector('#email').style.display='block';


   const div = document.createElement('div');

   div.className='card';


   const card_head = document.createElement('div');
   card_head.className="card-header";
   card_head.innerHTML=`<h5>${email.subject} <span style="float: right"> ${email.timestamp} </span></h5>`;
   div.append(card_head);

   const card_body = document.createElement('div');
   card_body.className='card-body'
   card_body.innerHTML=`<p>From: <span>${email.sender}</span></p>
                      <p>To: <span>${email.recipients}</span></p>
                      <p>Subject: <span>${email.subject}</span></p>`
   
   body_div = document.createElement('div');

   body_div.innerText=email.body;

   body_div.className='mb-4'

   body_div.style.fontWeight=500;

   body_div.style.fontSize='105%';

   card_body.append(body_div)

   btn_div = document.createElement('div');

   btn_div.className='row mt-3'

   const reply_btn = document.createElement('button');
   reply_btn.innerHTML='Reply'

   reply_btn.addEventListener('click',event => {
         const recipient = email.sender;
         let body = `On ${email.timestamp} <${email.sender}> wrote:\n\n${email.body}\n***********************************************\n`;
         let subject = email.subject;
         if(!subject.startsWith("Re: "))
         {
           subject = "Re: "+subject;
         }
         compose_email(event,subject,body,recipient);
   });


   reply_btn.className='btn btn-primary';

   reply_div = document.createElement('div');

   reply_div.className='col-4 col-md-2';
   
   reply_div.append(reply_btn);

   btn_div.append(reply_div);

   if(mailbox==='inbox')
   {

   const archive_button = document.createElement('button');
   archive_button.innerHTML='Archive';


   archive_button.addEventListener('click',() => {
      fetch(`emails/${email.id}`,{
         method: 'PUT',
         body: JSON.stringify({archived: true})
      })
      .then(response => {
         console.log(response)
         load_mailbox('inbox');
      })
   })


   archive_button.className='btn btn-primary';

   archive_button.setAttribute('id','archive');

   archive_button.style.display='none';

   archive_div = document.createElement('div');

   archive_div.className='col-4 col-md-2';
   
   archive_div.append(archive_button);

   btn_div.append(archive_div);

  }

  else 
  {
   const unarchive_button = document.createElement('button');
   unarchive_button.innerHTML='Un Archive';


   unarchive_button.addEventListener('click',() => {
      fetch(`emails/${email.id}`,{
         method: 'PUT',
         body: JSON.stringify({archived: false})
      })
      .then(response => {
         console.log(response)
         load_mailbox('inbox');
      })
   })

   unarchive_button.className='btn btn-primary';

   unarchive_button.setAttribute('id','unarchive');

   unarchive_button.style.display='none';

   unarchive_div = document.createElement('div');

   unarchive_div.className='col-4 col-md-2';
   
   unarchive_div.append(unarchive_button);

    btn_div.append(unarchive_div);
   }

   card_body.append(btn_div);

   div.append(card_body);

   document.querySelector('#email').append(div);
   
   
   if(mailbox!='sent')
   {
   if(email.archived)
   {
    document.querySelector('#unarchive').style.display='block';
   }
   else
   {
    document.querySelector('#archive').style.display='block';
   }
   }
   return false;
}
