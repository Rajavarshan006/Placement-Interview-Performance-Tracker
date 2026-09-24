import enum


class CompanyType(str, enum.Enum):
    PRODUCT = "PRODUCT"
    SERVICE = "SERVICE"
    STARTUP = "STARTUP"
    CONSULTING = "CONSULTING"


class DriveStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class RoundType(str, enum.Enum):
    APTITUDE = "APTITUDE"
    CODING = "CODING"
    TECHNICAL = "TECHNICAL"
    MANAGERIAL = "MANAGERIAL"
    HR = "HR"
    GROUP_DISCUSSION = "GROUP_DISCUSSION"


class Result(str, enum.Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"


class Priority(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class InterventionStatus(str, enum.Enum):
    GENERATED = "GENERATED"
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    DISMISSED = "DISMISSED"


class AccessStatus(str, enum.Enum):
    NO_ACCESS = "NO_ACCESS"
    INVITED = "INVITED"
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"
