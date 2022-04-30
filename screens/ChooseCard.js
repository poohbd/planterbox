import React, {useState, useEffect} from 'react';
import MQTT from 'sp-react-native-mqtt';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {Card} from 'react-native-paper';
import colors from '../assets/colors/colors';
import FlatButtonReg from '../components/buttonReg';
import TimeForm from '../components/timeform';
import LightForm from '../components/lightform';
import DropDownTime from '../components/dropdowntime';
import TimeFormAuto from '../components/timeformAuto';
import LightFormAuto from '../components/lightformAuto';
import axios from 'axios';
import Context from '../Context/context';

const deviceWidth = Dimensions.get('screen').width;
const deviceHeight = Dimensions.get('screen').height;

export default ChooseCard = ({route, navigation}) => {
  const {valuepreset,id,settingsid,UserID,UserName} = route.params;
  const plantName = valuepreset;
  pathImage = type => {
    switch (type) {
      case 'Sunflower':
        return require('../assets/images/Sunflower.png');
      case 'Basil':
        return require('../assets/images/Basil.png');
      case 'Cucumber':
        return require('../assets/images/Cucumber.png');
    }
  };
  const [isLoading, setLoading] = useState(true);
  
  const [data, setData] = useState();
  const getSetting = async () => {
    try {
      const config = {
        method: 'POST',
        url: 'http://192.168.1.44:3000/planterbox/settings',
        data: {
          id: id,
        },
      };
      const setting = await axios
        .request(config)
        .then(res => setData(res.data));
      //console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      // console.log(data);
    }
  };
  
  const deleteBox = async () => {
    try {
      //console.log("boxidchoosecard :"+id);
      const config = {
        method: 'DELETE',
        url: 'http://192.168.1.44:3000/planterbox/delete',
        data: {
          id: id,
        },
      };
      const setting = await axios.request(config);
      return navigation.navigate('Menu', {"UserID":UserID,"UserName":UserName});
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getSetting();
  }, []);
  const [sensor1, setSensor1] = useState('');
  const [sensor2, setSensor2] = useState('');
  const [sensor3, setSensor3] = useState('');
  const [sensorWaterBool, setSensorWaterBool] = useState('');
  const [sensorLightBool, setSensorLightBool] = useState('');
  let mqttClient = null;
  MQTT.createClient({
    uri: 'mqtts://66d6b91771ff4fc7bb664c04cc3e7fbb.s2.eu.hivemq.cloud:8883',
    clientId: 'clientId'+ Math.random().toString(16).substr(2, 8),
    user: 'ICERUS',
    pass: 'Projectyear3',
    auth: true,
    //keepalive:60,
  })
    .then(function (client) {
      client.on('closed', function () {
        console.log('mqtt.event.closed');
      });

      client.on('error', function (msg) {
        console.log('mqtt.event.error', msg);
      });

      client.on('message', function (msg) {
        //console.log('mqtt.event.message', msg);
        if(msg.topic==='sensor/light'){
          setSensor1(msg.data);
        }
        if(msg.topic==='sensor/rh'){
          setSensor2(msg.data);
        }
        if(msg.topic==='sensor/temp'){
          setSensor3(msg.data);
        }
        if(msg.topic==='sensor/watering'){
          setSensorWaterBool(msg.data);
        }
        if(msg.topic==='sensor/lighting'){
          setSensorLightBool(msg.data);
        }
      });

      client.on('connect', function () {
        console.log('connected');
        client.subscribe('sensor/+', 2);
        mqttClient = client;
        // client.publish('sensor2', 'planterbox', 2, false);
      });

      client.connect();
    })
    .catch(function (err) {
      console.log(err);
    });
  
  return (
    <Context.Consumer>
    {context => (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.newGreen2} />
      ) : (
        <ScrollView>
          <View style={styles.inline}>
            <TouchableOpacity
              style={styles.buttonBack}
              onPress={() => navigation.navigate('MyPlant')}>
              <Image source={require('../assets/images/back.png')} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonNoti}
              onPress={() => navigation.navigate('Tabs_Forum')}>
              <Image source={require('../assets/images/noti.png')} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonName}
              onPress={() => navigation.navigate('UserProfileHome', {"UserID":context.UserID})}>
              <View>
                <Text
                  style={{fontFamily: 'Mitr-Regular', color: colors.newGreen2}}>
                  {context.UserName}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonGray}
              onPress={() => navigation.navigate('UserProfileHome', {"UserID":context.UserID})}>
              <View>
                <Image source={require('../assets/images/graycircle.png')} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.containerNew}>
            <Text style={styles.header}>
              {plantName}
              {'\n'}
            </Text>
            <Image style={styles.imageSun} source={pathImage(plantName)} />
          </View>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <TimeForm data={data} />
              <LightForm data={data} />
              <DropDownTime type="FERTILIZER" sid={settingsid}  />
              <DropDownTime type="PESTICIDE" sid={settingsid} />
              <View style={styles.view} />
              <View style={styles.view} />
              <View style={styles.view} />
              {/* <DropDownTime type="FERTILIZER" />
            <DropDownTime type="PESTICIDE" /> */}
            </View>
            <View style={styles.inline2}>
              {sensorWaterBool === 'on' ?(
                  <TouchableOpacity
                    style={styles.watermanual}
                    onPress={()=>mqttClient.publish('sensor/watering', 'off', 1, true)}>
                    <View>  
                      <Image source={require('../assets/images/wateron.png')} />
                    </View>
                  </TouchableOpacity>) :(
                  <TouchableOpacity
                  style={styles.watermanual}
                  onPress={()=>mqttClient.publish('sensor/watering', 'on', 1, true)}>
                  <View>  
                    <Image source={require('../assets/images/wateroff.png')} />
                  </View>
                  </TouchableOpacity>)}
              {sensorLightBool === 'off' ?(
                  <TouchableOpacity
                    style={styles.lightmanual}
                    onPress={() => mqttClient.publish('sensor/lighting', 'low', 1, true)}>
                    <View>
                      <Image source={require('../assets/images/lightoff.png')} />
                    </View>
                  </TouchableOpacity>) : (null)}
              {sensorLightBool === 'low' ?(
                  <TouchableOpacity
                    style={styles.lightmanual}
                    onPress={() => mqttClient.publish('sensor/lighting', 'med', 1, true)}>
                    <View>
                      <Image source={require('../assets/images/lightlow.png')} />
                    </View>
                  </TouchableOpacity>) : (null)}
              {sensorLightBool === 'med' ?(
                  <TouchableOpacity
                  style={styles.lightmanual}
                  onPress={() => mqttClient.publish('sensor/lighting', 'high', 1, true)}>
                  <View>
                    <Image source={require('../assets/images/lightmed.png')} />
                  </View>
                </TouchableOpacity>) : (null)}
              {sensorLightBool === 'high' ?(
                  <TouchableOpacity
                  style={styles.lightmanual}
                  onPress={() => mqttClient.publish('sensor/lighting', 'off', 1, true)}>
                  <View>
                    <Image source={require('../assets/images/lighton.png')} />
                  </View>
                </TouchableOpacity>) : (null)}
              
            </View>
            <View style={styles.space} />
              <TouchableOpacity
                style={styles.buttonDelete}
                onPress={() => deleteBox()}>
                <View>
                <Text style={styles.buttonAddText}>DELETE BOX</Text>
                </View>
              </TouchableOpacity>
            </View>
        </ScrollView>
      )}
    </SafeAreaView>
    )}
    </Context.Consumer>
  );
};

const styles = StyleSheet.create({
  view: {
    width: 350,
    height: 100,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Mitr-Regular',
    fontSize: 23,
    paddingTop: 50,
    paddingLeft: 60,
    alignSelf: 'center',
    marginTop: 20,
  },
  container: {
    // flex: 1,
    backgroundColor: '#FFFFFF',
    // justifyContent: 'center',
  },
  buttonAdd: {
    paddingVertical: 8,
    width: 150,
    backgroundColor: colors.newGreen2,
    borderRadius: 20,
    marginTop: deviceHeight * 0.03,
    //marginLeft: deviceWidth*0.4,
    alignSelf: 'center',
  },
  buttonDelete: {
    paddingVertical: 8,
    width: 150,
    backgroundColor: colors.red,
    borderRadius: 20,
    marginTop: deviceHeight * 0.03,
    //marginLeft: deviceWidth*0.4,
    alignSelf: 'center',
  },
  containerNew: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontFamily: 'Mitr-Medium',
    fontSize: 23,
    color: colors.newGreen1,
    marginLeft: deviceWidth * 0.1,
  },
  inline: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonNoti: {
    //borderRadius: 20,
    //backgroundColor: '#CAD0D0',
    padding: 5,
    width: 30,
    height: 30,
    marginTop: deviceHeight * 0.085,
    marginLeft: deviceWidth * 0.5,
    backgroundColor: 'transparent',
  },
  buttonBack: {
    //borderRadius: 20,
    //backgroundColor: '#CAD0D0',
    padding: 5,
    width: 30,
    height: 30,
    marginTop: deviceHeight * 0.085,
    //marginLeft: deviceWidth*0.03,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    paddingLeft: deviceWidth * 0.06,
  },
  buttonName: {
    //borderRadius: 20,
    backgroundColor: '#CAD0D0',
    padding: 0,
    width: 80,
    height: 30,
    marginTop: deviceHeight * 0.087,
    marginLeft: deviceWidth * 0.05,
    backgroundColor: 'transparent',
  },
  watermanual: {
    //paddingVertical: 8,
    width: 40,
    height: 40,
    padding: 0,
    backgroundColor: colors.red,
    // marginTop: deviceHeight * 0.03,
    //marginRight: deviceWidth*0.1,
    backgroundColor: 'transparent',
  },
  inline2: {
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around'
  },
  lightmanual: {
    width: 40,
    height: 40,
    padding: 0,
    backgroundColor: colors.brown,
    // marginTop: deviceHeight * 0.03,
    //marginLeft: deviceWidth*0.1,
    backgroundColor: 'transparent',
  },
  buttonAddText: {
    color: '#FAFAFA',
    textAlign: 'center',
    fontFamily: 'Mitr-Regular',
    fontSize: 13,
  },
  buttonGray: {
    //borderRadius: 20,
    backgroundColor: '#CAD0D0',
    padding: 0,
    width: 70,
    height: 70,
    marginTop: deviceHeight * 0.06,
    backgroundColor: 'transparent',
  },
  back: {
    fontFamily: 'Mitr-Regular',
    fontSize: 23,
    lineHeight: 30,
    color: colors.newGreen2,
  },
  card: {
    width: deviceWidth,
    marginTop: -20,
    borderRadius: 30,
    backgroundColor: colors.newGreen1,
    fontFamily: 'Mitr-Regular',
    fontSize: 23,
    padding: 10,
    alignSelf: 'center',
  },
  cardContent: {
    textAlign: 'center',
    fontFamily: 'Mitr-Regular',
    fontSize: 16,
    lineHeight: 30,
    color: colors.darkGray,
  },
  image: {
    marginBottom: 30,
    alignSelf: 'center',
  },
  space: {
    width: 20,
    height: 30,
  },
  button: {
    paddingVertical: 8,
    width: 80,
    backgroundColor: colors.newGreen2,
    borderRadius: 20,
    marginTop: deviceHeight * 0.25,
    marginLeft: deviceWidth * 0.55,
  },
  buttonText: {
    color: '#FAFAFA',
    textAlign: 'center',
    fontFamily: 'Mitr-Regular',
    fontSize: 13,
  },
  imageSun: {
    //opacity:0.5,
    alignSelf: 'flex-end',
    marginLeft: deviceWidth * 0.3,
    // marginTop:deviceHeight*0.005,
    // marginLeft:deviceWidth*0.1,
    // marginBottom: deviceHeight*0.1,
    height: 100,
    width: 100,
  },
});
