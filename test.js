function pilgram(str){
    var res = str.toLowerCase();
    for(let i = 97 ; i <123; i++ ){
        let alphabet = String.fromCharCode(i);
        
        if(res.indexOf(alphabet)<0)
        return console.log("not pilingram");
        
           
    }
    return console.log("pilingram");
    
    
}
pilgram('we promptly e next prize')