

arr=[12,3,4,5];


const newarr=arr.map((number,index,arr)=>{
    console.log(number,index,arr)
    return number>2
})

console.log(newarr)