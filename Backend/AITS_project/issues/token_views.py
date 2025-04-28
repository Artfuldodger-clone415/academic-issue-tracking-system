from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
import logging

logger = logging.getLogger(__name__)
 # Tpken craetion and validation
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
                
            # Add extra user info to the token response
            user = self.user
            data.update({
                'id': user.id,
                'username': user.username, 
                'role': user.role,  
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email, 
                'college': user.college 
            }) 
            
            # Log successful authentication
            logger.info(f"User authenticated: {user.username}, Role: {user.role}")
            
            return data
        except Exception as e:
            # Log authentication failure
            username = attrs.get('username', 'unknown')
            logger.error(f"Authentication failed for {username}: {str(e)}")
            raise 

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
