import React from 'react' // Удалили стили дфолтные реакта, лого, и гит через rm -rf .git
                          // так же в корне проекта, в package.json запустили скрипт "client": "npm run start --prefix client" чтобы будучи там можно было запускать команду в клиенте
function App() {
  return (
   <div>
     <h1>Hello react</h1>
   </div>
  ) 
}

export default App;
