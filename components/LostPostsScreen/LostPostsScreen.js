import React, {Component} from 'react';
import {View, Text, Image} from 'react-native';
import {Icon, Button} from 'react-native-elements';
import {ActivityIndicator} from 'antd-mobile';
import List from '../List/List';
import {lostPostsRef} from '../../firebaseConfig';
import httpRequest from '../../library/httpRequest';
import style from './Style';
import PTRView from 'react-native-pull-to-refresh';

class LostPostsScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Lost Posts',
    headerRight: <Icon
      name='add-circle'
      color='#e91e63'
      size={35}
      containerStyle={{marginRight: 12}}
      onPress={() => navigation.navigate('PostForm', {
        type: "lost"
      })}
    />,
    tabBarIcon: ({tintColor}) => (
      <Image
        source={require('../../assets/images/item.png')}
        style={{tintColor: tintColor}}
      />
    )
  });

  state = {
    loading: true,
    list: [],
    keyword: '',
    location: '',
    date: '',
    category: ''
  }

  componentDidMount() {
    this.refreshPostlist()
  }

  refreshPostlist = () => {
    this.setState({
      loading: true,
      list: []
    });
    const {date, location, keyword, category} = this.state;
    httpRequest("lost", {date, location, keyword, category})
    .then((response) => {
      this.setState({
        loading: false,
        list: response
      })
    })
    .catch((error) => {
      console.log(error);
    })
  }

  searchUpdatedCallback = (newState) => {
    const {
      keyword,
      location,
      date
    } = newState;
    this.setState({
      keyword,
      location,
      date
    }, () => {
      this.refreshPostlist();
    });
  }

  _pullToRefresh = () => {
    return new Promise((resolve, reject) => {
      const {date, location, keyword, category} = this.state;
      httpRequest("lost", {date, location, keyword, category})
      .then((response) => {
        this.setState({
          list: response
        }, () => {
          resolve();
        })
      })
      .catch((error) => {
        reject(error);
      })
    })
  }

  _onSearchPress = () => {
    const {navigate} = this.props.navigation;
    const {
      navigation,
      keyword,
      date,
      location,
    } = this.state;
    navigate('Search', {
      keyword,
      date,
      location,
      searchUpdatedCallback: this.searchUpdatedCallback
    })
  };
 

  render() {
    const {navigate} = this.props.navigation;
    const loadingOrList = this.state.loading 
      ? <View style={style.loading}>
          <ActivityIndicator animating text='Fetching Items'/>
        </View>
      : <PTRView
          onRefresh={this._pullToRefresh}
          offset={65}
        >
          <List navigate={navigate} list={this.state.list} />
        </PTRView>

    return (
      <View style={style.containerStyle}>
        <Button
          iconLeft
          icon={{name: 'search', size: 26}}
          title='Search'
          fontWeight={'500'}
          containerViewStyle={style.buttonContainer}
          buttonStyle={style.buttonStyle}
          onPress={() => this.props.navigation.navigate('TemSearch', {
            type: "lost"
          })}
          borderRadius={50}
        />
        {loadingOrList}
      </View>
    );
  }
}

export default LostPostsScreen;