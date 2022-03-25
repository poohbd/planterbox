import React from 'react';
import {StyleSheet,View,Text,TouchableOpacity} from 'react-native';
import colors from '../assets/colors/colors';

export default function FlatButton({text, onPress}){
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <View>
                <Text style={styles.buttonText}>{text}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button:{
        paddingVertical:10,
        width:300,
        backgroundColor:colors.newGreen2,
        borderRadius:20,
        marginBottom:12,
    },
    buttonText:{
        color:'#FAFAFA',
        textAlign:'center',
        fontFamily:'Mitr-Regular',
        fontSize:13
    },
});