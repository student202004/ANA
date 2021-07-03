import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,TextInput ,Image, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component{
    constructor(){
        super();

        this.state={
          hasCameraPermissions:null,
          scanned:false,
          scannedBookId:'',
          scannedStudentId:'',
          buttonState:'normal',
          transactionMessage:''
}
    }


    hasHandleBarCodeScanned=async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==="BookId"){
            this.setState({
                scanned:true,
                scannedBookId:data,
                buttonState:'normal'
               
            })
        }
        else if(buttonState==="StudentId"){
            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:'normal'
               
            })
        }

    }
    getCameraPermissions=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions:status==="granted",
            scanned:false,
            buttonState:id,
           
        })
    }
    initiateBookIssue=async()=>{
        db.collection("transaction").add({
            'studentID':this.state.scannedStudentId,
            'bookID':this.state.scannedBookId,
            'transactionType':"Issue",
            'dateOfTransaction': firebase.firestore.Timestamp.now().toDate()
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailable':false,
            
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
        Alert.alert('book Issued');
        this.setState({
            scannedBookId:'',
            scannedStudentId:'',
        })
    }
    initiateBookReturn=async()=>{
        db.collection("transaction").add({
            'studentID':this.state.scannedStudentId,
            'bookID':this.state.scannedBookId,
            'transactionType':"Return",
            'dateOfTransaction': firebase.firestore.Timestamp.now().toDate()
        })
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailable':true,
            
        })
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
        Alert.alert('book Returned');
        this.setState({
            scannedBookId:'',
            scannedStudentId:'',
        })
    }

    handleTransaction=async()=>{
      var transactionMessage;
      db.collection("books").doc(this.state.scannedBookId).get()
          .then((doc)=>{
              
           var book=doc.data();
           if(book.bookAvailable){
               this.initiateBookIssue();
               transactionMessage="bookIssued"
           }
           else{
               this.initiateBookReturn();
               transactionMessage="bookReturned"
           }
          })
          this.setState({
              transactionMessage:transactionMessage
          })
      
     }
        render(){
            const hasCameraPermissions=this.state.hasCameraPermissions;
         const scanned=this.state.scanned;
         const buttonState=this.state.buttonState;
         if(buttonState!=="normal" && hasCameraPermissions){
             return(
                 <BarCodeScanner
                  onBarCodeScanned={
                      scanned? undefined : this.hasHandleBarCodeScanned
                  }
                  style={StyleSheet.absoluteFillObject}
                 >

                 </BarCodeScanner>
             )
         }
         else if(buttonState==="normal"){

        return(

            <View style={styles.container}>
                <View>
                    <Image style={{width:200,height:200}}
                    source={require('../assets/booklogo.jpg')}></Image>
                    <Text style={{textAlign:'center',fontSize:30}}>Wily</Text>
                </View>
           <View style={styles.inputView}>
               <TextInput styles={styles.inputBox}
                          placeholder="book Id"
                          value={this.state.scannedBookId}>
              
                          </TextInput>
               <TouchableOpacity style={styles.scanButton }
                                 onPress={()=>{this.getCameraPermissions("BookId")}} >
                   <Text style={styles.buttonText}>Scan</Text>
               </TouchableOpacity>
           </View>

           <View style={styles.inputView}>
               <TextInput styles={styles.inputBox}
                          placeholder="student Id"
                          value={this.state.scannedStudentId}>

                          </TextInput>
               <TouchableOpacity style={styles.scanButton}
                                 onPress={()=>{this.getCameraPermissions("StudentId")}}>
                   <Text style={styles.buttonText}>Scan</Text>
               </TouchableOpacity>
           </View>
          
               <TouchableOpacity style={styles.submitbutton}
                                 onPress={async()=>{
                                     this.handleTransaction();
                                 }}>
                   <Text style={styles.submitbuttontext}>Submit</Text>
               </TouchableOpacity>
        
            </View>

        )
            }
    }
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    },
    button:{
        backgroundColor:'yellow',
        margin:10,
        padding:10,
    },
    displaytext:{
        fontSize:20,
        textDecorationLine:'underline',
    },
    buttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop:10,

    },
    inputView:{
        flexDirection:'row',
        margin:20,
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20,
    },
   scanButton:{
       backgroundColor:'yellow',
       width:50,
       borderWidth:1.5,
       borderLeftWidth:0,
   },
   submitbutton:{
       backgroundColor:'red',
       width:100,
       height:50,
   },
   submitbuttontext:{
       textAlign:'center',
       padding:10,
       fontSize:20,
       color:'white',
       fontWeight:'bold',
   },
})