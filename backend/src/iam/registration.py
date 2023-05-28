import datetime
import logging

from users.models import User, Company

logger = logging.getLogger(__name__)


class UserData:

    def validate_dob(self, date_text):
        if not date_text:
            return None
        try:
            return str(datetime.datetime.strptime(date_text, '%Y-%m-%d').date())
        except ValueError:
            return None

    def validate_user_role(self, user_role):
        if user_role == 'tenant':
            user_role = User.RoleType.TENANT
        else:
            user_role = User.RoleType.LANDLORD
        return user_role

    def validate_company_name(self, company_name):
        if not company_name:
            return None
        return company_name

    def validate_company_address(self, company_address):
        if not company_address:
            return None
        return company_address

    def validate_tax_number(self, tax_number):
        if not tax_number:
            return None
        return tax_number

    def validate_position(self, position):
        if not position:
            return None
        return position

    def validate_phone(self, phone):
        if not phone:
            return None
        phone = ''.join(char for char in phone if char.isdigit())
        if len(phone) > 15:
            return None
        return phone

    @staticmethod
    def register(userinfo):
        user_id = userinfo.get('sub')
        name = userinfo.get('given_name')
        surname = userinfo.get('family_name')
        patronymic = userinfo.get('patronymic')
        email = userinfo.get('email')
        date_of_birth = UserData().validate_dob(userinfo.get('dateOfBirth'))
        phone = UserData().validate_phone(userinfo.get('phone'))
        user_role = UserData().validate_user_role(userinfo.get('userRole'))
        position = UserData().validate_position(userinfo.get('position'))

        user = User.objects.create(id=user_id,
                                   name=name,
                                   surname=surname,
                                   patronymic=patronymic,
                                   email=email,
                                   date_of_birth=date_of_birth,
                                   phone=phone,
                                   role=user_role,
                                   position=position)

        if user_role == User.RoleType.LANDLORD:
            company_name = UserData().validate_company_name(userinfo.get('companyName'))
            company_address = UserData().validate_company_address(userinfo.get('companyAddress'))
            tax_number = UserData().validate_tax_number(userinfo.get('taxNumber'))

            Company.objects.create(
                name=company_name,
                address=company_address,
                tax_number=tax_number,
                owner=user
            )
        return user
